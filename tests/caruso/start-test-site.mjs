import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const child=spawn(process.execPath,['--import',fileURLToPath(new URL('./mock-storage.mjs',import.meta.url)),require.resolve('next/dist/bin/next'),'dev','--hostname','127.0.0.1','--port','3099','--webpack'],{
 cwd:fileURLToPath(new URL('../../',import.meta.url)),stdio:'inherit',env:{...process.env,NODE_ENV:'development',
 CARUSO_RECIPE_GITHUB_REPOSITORY:'recipe-test/book',CARUSO_RECIPE_GITHUB_BRANCH:'recipe-workflow-test',CARUSO_RECIPE_GITHUB_TOKEN:'local-test-only',
 CARUSO_RECIPE_ADD_TOKEN:'local-editor-test',SECRET_PROJECTS_SESSION_SECRET:'local-tests-only-not-a-production-secret',
 PROJECT_STORAGE_API_SECRET:'local-test-only',CRM_PROJECT_STORAGE_ENDPOINT:'https://recipe-test-storage.invalid/storage'},
});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??1));
