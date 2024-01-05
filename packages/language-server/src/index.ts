import { getLanguageModule } from './language-server-plugin';
import { create as createEmmetService } from 'volar-service-emmet';
import { create as createHtmlService } from 'volar-service-html';
import { create as createCssService } from 'volar-service-css';
import { create as createTypeScriptService } from 'volar-service-typescript';
import { createNodeServer, createConnection, createSimpleProjectProvider } from '@volar/language-server/node';
import {NgFile} from "./virtualFile/ngFile";
import {Diagnostic} from "@volar/language-server";

const connection = createConnection();
const server = createNodeServer(connection);

connection.listen();

connection.onInitialize(params => {
	const ts = require('typescript');
	return server.initialize(params, createSimpleProjectProvider, {
		getLanguagePlugins() {
			return [getLanguageModule(ts)];
		},
		getServicePlugins() {
			return [
				createHtmlService(),
				createCssService(),
				createEmmetService(),
				createTypeScriptService(ts),
				{
					create(context) {
						return {
							provideDiagnostics(document) {

								const fileName = context.env.uriToFileName(document.uri);
								const [file] = context.language.files.getVirtualFile(fileName);
								if (!(file instanceof NgFile)) return;

								const styleNodes = file.htmlDocument.roots.filter(root => root.tag === 'style');
								if (styleNodes.length <= 1) return;

								const errors: Diagnostic[] = [];
								for (let i = 1; i < styleNodes.length; i++) {
									errors.push({
										severity: 2,
										range: {
											start: file.document.positionAt(styleNodes[i].start),
											end: file.document.positionAt(styleNodes[i].end),
										},
										source: 'ng',
										message: 'Only one style tag is allowed.',
									});
								}
								return errors;
							},
						}
					},
				},
			];
		},
	});
});

connection.onInitialized(() => {
	server.initialized();
});

connection.onShutdown(() => {
	server.shutdown();
});
