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
import { logger } from "firebase-functions";
import config from "./config";

const obfuscatedConfig = {
  ...config,
  algoliaAPIKey: "********",
};

export const init = () => {
  logger.info("Initializing extension with configuration", obfuscatedConfig);
};

export const start = () => {
  logger.info("Started extension execution with configuration", obfuscatedConfig);
};

export const error = (err: Error) => {
  logger.error("Error when performing Algolia index", err);
};

export const createIndex = (id: string, data: object) => {
  logger.info(`Creating new Algolia index for document ${id}`, data);
};

export const updateIndex = (id: string, data: object) => {
  logger.info(`Updating existing Algolia index for document ${id}`, data);
};

export const deleteIndex = (id: string) => {
  logger.info(`Deleting existing Algolia index for document ${id}`);
};

export const fieldNotExist = (field: string) => {
  logger.warn(`The field "${field}" was specified in the extension config but was not found on collection data.`);
};
