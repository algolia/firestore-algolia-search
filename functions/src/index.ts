/*
 * This template contains a FireStore functions that monitor changes to the collection.
 *
 * Always use the FUNCTIONS HANDLER NAMESPACE
 * when writing Cloud Functions for extensions.
 * Learn more about the handler namespace in the docs
 *
 * Reference PARAMETERS in your functions code with:
 * `process.env.<parameter-name>`
 * Learn more about parameters in the docs
 */
// import algoliasearch from 'algoliasearch';
import * as functions from 'firebase-functions';
import { Change, EventContext } from 'firebase-functions';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

console.log(process.env.APPLICATION_ID, process.env.API_KEY, process.env.INDEX_NAME, process.env.COLLECTION)

// const client = algoliasearch(process.env.APPLICATION_ID as string, process.env.API_KEY as string);
// const index = client.initIndex(process.env.INDEX_NAME ?? process.env.COLLECTION as string);

export const createUpdateRecord = functions.handler.firestore.document
    .onWrite((change: Change<DocumentSnapshot>, context: EventContext) => {
        // const data = change.after.data();
        // if (data) {
        //     const objectID = change.after.id;
        //     console.log('trying to index data', data, objectID);
        //     return index.saveObject({
        //         ...data,
        //         objectID,
        //     }).catch(console.log);
        // }
        // console.log('no data found');
        // return Promise.reject();
    });
