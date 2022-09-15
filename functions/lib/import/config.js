"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseConfig = exports.DEFAULT_BATCH_SIZE = void 0;
const commander_1 = require("commander");
const inquirer_1 = require("inquirer");
exports.DEFAULT_BATCH_SIZE = 200;
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
        default: exports.DEFAULT_BATCH_SIZE,
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
    {
        message: "Would you like to run the script across multiple threads?",
        name: "multiThreaded",
        type: "confirm",
        default: false,
    },
];
const parseConfig = async (options) => {
    const { projectId, collectionPath, fields, algoliaAppId, algoliaApiKey, algoliaIndexName, transformFunction, batchSize, multiThreaded, } = options.nonInteractive ? options : await inquirer_1.prompt(questions);
    if (!projectId ||
        !collectionPath ||
        !algoliaAppId ||
        !algoliaApiKey ||
        !algoliaIndexName) {
        commander_1.program.help();
    }
    process.env.PROJECT_ID = projectId;
    process.env.COLLECTION_PATH = collectionPath;
    process.env.FIELDS = fields;
    process.env.ALGOLIA_APP_ID = algoliaAppId;
    process.env.ALGOLIA_API_KEY = algoliaApiKey;
    process.env.ALGOLIA_INDEX_NAME = algoliaIndexName;
    process.env.TRANSFORM_FUNCTION = transformFunction;
};
exports.parseConfig = parseConfig;
