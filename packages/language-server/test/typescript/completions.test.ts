import { Position } from '@volar/language-server';
import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import { getLanguageServer, type LanguageServer } from '../server.js';

describe('TypeScript - Completions', async () => {
    let languageServer: LanguageServer;

    before(async () => {
        languageServer = await getLanguageServer()
    });

    it('Can get completions in the script blog', async () => {
        const document = await languageServer.openFakeDocument('<script>\nc\n</script>', 'ng');
        const completions = await languageServer.handle.sendCompletionRequest(
            document.uri,
            Position.create(1, 1)
        );

        expect(completions?.items).to.not.be.empty;
    });
});