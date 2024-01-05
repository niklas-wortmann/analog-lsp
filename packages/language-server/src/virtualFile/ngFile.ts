import {type CodeMapping, VirtualFile} from "@volar/language-core";
import * as html from "vscode-html-languageservice";
import * as ts from "typescript/lib/tsserverlibrary";
import {DiagnosticMessage} from "typescript";


const htmlLs = html.getLanguageService();

export class NgFile implements VirtualFile {

    fileName: string;
    languageId = 'ng';
    typescript?: {
        scriptKind: ts.ScriptKind.TSX;
    };
    mappings!: CodeMapping[];
    embeddedFiles!: VirtualFile[];
    document!: html.TextDocument;
    htmlDocument!: html.HTMLDocument;
    scriptFiles: string[] = [];
    compilerDiagnostics!: DiagnosticMessage[];

    constructor(
        public sourceFileName: string,
        public snapshot: ts.IScriptSnapshot,
    ) {
        this.fileName = sourceFileName;
        this.onSnapshotUpdated();
    }

    public update(newSnapshot: ts.IScriptSnapshot) {
        this.snapshot = newSnapshot;
        this.onSnapshotUpdated();
    }
    //
    // get mainTsFile() {
    //     const [mainFile] = this.embeddedFiles.filter(x => x.languageId === "typescript");
    //     return mainFile
    // }
    //
    // get hasCompilationErrors(): boolean {
    //     return this.compilerDiagnostics.length > 0;
    // }

    onSnapshotUpdated() {
        this.compilerDiagnostics = [];

        this.mappings = [{
            sourceOffsets: [0],
            generatedOffsets: [0],
            lengths: [this.snapshot.getLength()],
            data: {
                completion: true,
                format: true,
                navigation: true,
                semantic: true,
                structure: true,
                verification: true,
            },
        }];
        this.document = html.TextDocument.create('', 'html', 0, this.snapshot.getText(0, this.snapshot.getLength()));
        this.htmlDocument = htmlLs.parseHTMLDocument(this.document);
        this.embeddedFiles = [];

        this.addEmbeddedLanguages();

        this.scriptFiles = this.embeddedFiles.filter(x => x.languageId === "typescript").map((scriptTag) => scriptTag.fileName);
    }

    addEmbeddedLanguages() {
        let i = 0;
        this.htmlDocument.roots.forEach(root => {
            if (root.startTagEnd !== undefined && root.endTagStart !== undefined) {
                if (root.tag === 'style') {
                    const styleText = this.snapshot.getText(root.startTagEnd, root.endTagStart);
                    this.embeddedFiles.push({
                        fileName: this.fileName + `.${i++}.css`,
                        languageId: 'css',
                        snapshot: {
                            getText: (start, end) => styleText.substring(start, end),
                            getLength: () => styleText.length,
                            getChangeRange: () => undefined,
                        },
                        mappings: [{
                            sourceOffsets: [root.startTagEnd],
                            generatedOffsets: [0],
                            lengths: [styleText.length],
                            data: {
                                completion: true,
                                format: true,
                                navigation: true,
                                semantic: true,
                                structure: true,
                                verification: true,
                            },
                        }],
                        embeddedFiles: [],
                    });
                }
                if (root.tag === 'template') {
                    const template = this.snapshot.getText(root.startTagEnd, root.endTagStart);
                    this.embeddedFiles.push({
                        fileName: this.fileName + `.${i++}.html`,
                        languageId: 'html',
                        snapshot: {
                            getText: (start, end) => template.substring(start, end),
                            getLength: () => template.length,
                            getChangeRange: () => undefined,
                        },
                        mappings: [{
                            sourceOffsets: [root.startTagEnd],
                            generatedOffsets: [0],
                            lengths: [template.length],
                            data: {
                                completion: true,
                                format: true,
                                navigation: true,
                                semantic: true,
                                structure: true,
                                verification: true,
                            },
                        }],
                        embeddedFiles: [],
                    });
                } else if (root.tag === 'script') {
                    const tsText = this.snapshot.getText(root.startTagEnd, root.endTagStart);
                    this.embeddedFiles.push({
                        fileName: this.fileName + `.${i++}.ts`,
                        languageId: 'typescript',
                        snapshot: {
                            getText: (start, end) => tsText.substring(start, end),
                            getLength: () => tsText.length,
                            getChangeRange: () => undefined,
                        },
                        mappings: [{
                            sourceOffsets: [root.startTagEnd],
                            generatedOffsets: [0],
                            lengths: [tsText.length],
                            data: {
                                completion: true,
                                format: true,
                                navigation: true,
                                semantic: true,
                                structure: true,
                                verification: true,
                            },
                        }],
                        embeddedFiles: [],
                    });
                }
            }
        });
    }

}