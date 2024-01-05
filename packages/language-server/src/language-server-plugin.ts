
import {NgFile} from "./virtualFile/ngFile";
import {
	LanguagePlugin,
} from '@volar/language-server/node';
import * as path from "node:path";

export function getLanguageModule(ts: typeof import('typescript')): LanguagePlugin<NgFile> {
	return {
		createVirtualFile(fileName, langaugeId, snapshot) {
			if (langaugeId === 'ng') {
				return new NgFile(fileName, snapshot);
			}
		},
		updateVirtualFile(ngFile, snapshot) {
			ngFile.update(snapshot);
		},
		typescript: {
			extraFileExtensions: [{ extension: 'ng', isMixedContent: true, scriptKind: 7 }],
			resolveSourceFileName(tsFileName) {
				return path.basename(tsFileName);
			},
			resolveModuleName(moduleName, impliedNodeFormat) {
				if (
					impliedNodeFormat === ts.ModuleKind.ESNext &&
					moduleName.endsWith('.ng')
				) {
					return `${moduleName}.js`;
				}
			},
			resolveLanguageServiceHost(host) {
				return {
					...host,
					getScriptFileNames() {
						const fileNames = host.getScriptFileNames();
						return [
							...fileNames,
							// ...(astroInstall
							// 	? ['./env.d.ts', './astro-jsx.d.ts'].map((filePath) =>
							// 		ts.sys.resolvePath(path.resolve(astroInstall.path, filePath))
							// 	)
							// 	: []),
						];
					},
					getCompilationSettings() {
						const baseCompilationSettings = host.getCompilationSettings();
						return {
							...baseCompilationSettings,
							module: ts.ModuleKind.ES2022 ?? 99,
							target: ts.ScriptTarget.ES2022 ?? 99,
							moduleResolution: ts.ModuleResolutionKind.Node16
						};
					},
				};
			},
		},
	}
}