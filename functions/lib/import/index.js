#!/usr/bin/env node
"use strict";
/*
 * Copyright 2021 Algolia
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const inquirer_1 = require("inquirer");
const DEFAULT_BATCH_SIZE = 200;
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
    .option("-T --transform-function <transform-function>", "Firebase Cloud Function for any data transformation before saving into Algolia.")
    .option("--batch-size <number>", "The number of documents to process in each batch.", `${DEFAULT_BATCH_SIZE}`)
    .action(run)
    .parseAsync(process.argv);
const FIRESTORE_VALID_CHARACTERS = /^[^\/]+$/;
const PROJECT_ID_MAX_CHARS = 6144;
const FIRESTORE_COLLECTION_NAME_MAX_CHARS = 6144;
const validateInput = (value, name, regex, sizeLimit) => {
    if (!value || value === "" || value.trim() === "") {
        return `Please supply a ${name}`;
    }
    if (value.length >= sizeLimit) {
        return `${name} must be at most ${sizeLimit} characters long`;
    }
    if (!value.match(regex)) {
        return `The ${name} must only contain letters or spaces`;
    }
    return true;
};
const questions = [
    {
        message: "What is your Firebase project ID.",
        name: "projectId",
        type: "input",
        validate: (value) => validateInput(value, "Firebase project ID", FIRESTORE_VALID_CHARACTERS, PROJECT_ID_MAX_CHARS),
    },
    {
        message: "What is the path to the Cloud Firestore collection where the extension should monitor for changes?",
        name: "collectionPath",
        type: "input",
        validate: (value) => validateInput(value, "Cloud Firestore collection", FIRESTORE_VALID_CHARACTERS, FIRESTORE_COLLECTION_NAME_MAX_CHARS),
    },
    {
        message: "What are the fields that you want to index?",
        name: "fields",
        type: "input",
    },
    {
        message: "What is your Algolia application ID?",
        name: "algoliaAppId",
        type: "input",
    },
    {
        message: "What is your Algolia API key?",
        name: "algoliaApiKey",
        type: "input",
    },
    {
        message: "What is your Algolia index name?",
        name: "algoliaIndexName",
        type: "input",
    },
    {
        message: "Specify a Firebase Cloud Function for any data transformation before saving into Algolia.",
        name: "transformFunction",
        type: "input",
    },
    {
        message: "How many documents should be processed at once?",
        name: "batchSize",
        type: "input",
        default: DEFAULT_BATCH_SIZE,
        validate: (value) => {
            const parsed = parseInt(value, 10);
            if (isNaN(parsed))
                return "Please supply a valid number";
            else if (parsed < 1)
                return "Please supply a number greater than 0";
            else
                return true;
        },
    },
];
async function run(options) {
    const { projectId, collectionPath, fields, algoliaAppId, algoliaApiKey, algoliaIndexName, transformFunction, batchSize, } = options.nonInteractive ? options : await inquirer_1.prompt(questions);
    if (!projectId ||
        !collectionPath ||
        !algoliaAppId ||
        !algoliaApiKey ||
        !algoliaIndexName) {
        commander_1.program.help();
    }
    process.env.PROJECT_ID = projectId;
    process.env.COLLECTION_PATH = collectionPath;
    if (fields)
        process.env.FIELDS = fields;
    process.env.ALGOLIA_APP_ID = algoliaAppId;
    process.env.ALGOLIA_API_KEY = algoliaApiKey;
    process.env.ALGOLIA_INDEX_NAME = algoliaIndexName;
    if (transformFunction)
        process.env.TRANSFORM_FUNCTION = transformFunction;
    process.env.BATCH_SIZE = batchSize;
    require("./run");
}
