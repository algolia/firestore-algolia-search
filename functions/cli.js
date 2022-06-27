#!/usr/bin/env node
const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

rl.question(`\nWARNING: The back fill process will index your entire collection which will impact your Search Operation Quota.  Please visit https://www.algolia.com/doc/faq/accounts-billing/how-algolia-count-records-and-operation/ for more details.  Do you want to continue? (y/N): `, function(answer) {
  const value = answer || 'n'
  if ('y' === value.toLowerCase()) {
    rl.question('What is the Region? ', function (location) {
      if (!location) {
        rl.close();
      }
      process.env.LOCATION = location;
      rl.question('What is the Project Id? ', function (projectId) {
        if (!projectId) {
          rl.close();
        }
        process.env.PROJECT_ID = projectId;
        rl.question('What is the Algolia App Id? ', function (algoliaAppId) {
          if (!algoliaAppId) {
            rl.close();
          }
          process.env.ALGOLIA_APP_ID = algoliaAppId;
          rl.question('What is the Algolia Api Key? ', function (algoliaAPIKey) {
            if (!algoliaAPIKey) {
              rl.close();
            }
            process.env.ALGOLIA_API_KEY = algoliaAPIKey;
            rl.question('What is the Algolia Index Name? ', function (algoliaIndexName) {
              if (!algoliaIndexName) {
                rl.close();
              }
              process.env.ALGOLIA_INDEX_NAME = algoliaIndexName;
              rl.question('What is the Collection Path? ', function (collectionPath) {
                if (!collectionPath) {
                  rl.close();
                }
                process.env.COLLECTION_PATH = collectionPath;
                rl.question('What are the Fields to extract? ', function (fields) {
                  process.env.FIELDS = fields;
                  rl.question('What is the Transform Function? ', function (transformFunction) {
                    process.env.TRANSFORM_FUNCTION = transformFunction;
                    rl.question('What is the path to the Google Application Credential File? ', function (googleApplicationCredential) {
                      if (!googleApplicationCredential) {
                        rl.close();
                      }
                      process.env.GOOGLE_APPLICATION_CREDENTIALS = googleApplicationCredential;
                      require('./lib/import/index');
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  } else {
    rl.close();
  }
});

rl.on('close', function () {
  process.exit(0);
});
