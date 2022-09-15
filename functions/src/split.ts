'use strict';
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

import fetch from 'node-fetch';
import config from './config';
import * as logs from './logs';

export default async payload => {
  if (config.splitFunction) {
    try {
      const response = await fetch(`https://${config.location}-${config.projectId}.cloudfunctions.net/${config.splitFunction}`, {
        method: 'post',
        body:    JSON.stringify({ data: payload }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response?.json();
      return data.result;
    } catch (e) {
      logs.error(e);
    }
  }
  return payload;
}
