#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const config_1 = require("./config");
const packageJson = require("../../package.json");
commander_1.program
    .name(packageJson.name)
    .version(packageJson.version)
    .description(packageJson.description)
    .option("--non-interactive", "Parse all input from command line flags instead of prompting the caller.", false)
    .option("-P --project-id <project-id>", "Firebase project ID.")
    .option("-C --collection-path <collection-path>", "Path to the Cloud Firestore collection where the extension should monitor for changes.")
    .option("-F --fields <fields>", "Fields to index, a comma separated list or left blank to index all fields.")
    .option("-A --algolia-app-id <algolia-app-id>", "Algolia application you want to index your data to.")
    .option("-K --algolia-api-key <algolia-api-key>", "Algolia API key that has write access to the Algolia application.")
    .option("-I --algolia-index-name <algolia-index-name>", "Algolia index name where the records will be persisted.")
    .option("--batch-size <batch-size>", "The number of documents to process in each batch.", `${config_1.DEFAULT_BATCH_SIZE}`)
    .option("--multi-threaded <multi-threaded>", "Whether to run the script across multiple threads.", false)
    .action(run)
    .parseAsync(process.argv);
async function run(options) {
    await config_1.parseConfig(options);
    require("./import");
}
