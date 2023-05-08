import { firestore } from 'firebase-admin';
import Timestamp = firestore.Timestamp;

export const documentID = 'document/1';

export const testReleaseDate = new Date(1995, 12, 1);

export default {
  'title': 'The Shawshank Redemption',
  'alternative_titles': [
    'En verden udenfor',
    'Cadena Perpetua',
    'A remény rabjai',
    'Um Sonho de Liberdade',
    'The Shawshank Redemption - Stephen King'
  ],
  'year': 1994,
  'meta': {
    'releaseDate': Timestamp.fromDate(testReleaseDate),
  },
  'awards': [
    new firestore.Firestore().doc('/awards/1'),
  ],
  'image': 'https://image.tmdb.org/t/p/w154/9O7gLzmreU0nGkIB6K3BsJbzvNv.jpg',
  'color': '#8C634B',
  'score': 9.97764206054169,
  'rating': 5,
  'actors': [
    'Tim Robbins',
    'Morgan Freeman',
    'Bob Gunton',
    'William Sadler',
    'Clancy Brown',
    'Gil Bellows',
    'Mark Rolston',
    'James Whitmore',
    'Jeffrey DeMunn',
    'Larry Brandenburg',
    'David Proval',
    'Jude Ciccolella'
  ],
  'actor_facets': [
    'https://image.tmdb.org/t/p/w45/tuZCyZVVbHcpvtCgriSp5RRPwMX.jpg|Tim Robbins',
    'https://image.tmdb.org/t/p/w45/oGJQhOpT8S1M56tvSsbEBePV5O1.jpg|Morgan Freeman',
    'https://image.tmdb.org/t/p/w45/b3NfI0IzPYI40eIEtO9O0XQiR8j.jpg|Bob Gunton',
    'https://image.tmdb.org/t/p/w45/deRJUFbO8uqPSQT3B6Vgp4jiJir.jpg|William Sadler',
    'https://image.tmdb.org/t/p/w45/pwiG1ljLoqfcmFH2zFp5NP2ML4B.jpg|Clancy Brown',
    'https://image.tmdb.org/t/p/w45/f5An5NqejnTEflFmW7Vp18zVOvJ.jpg|Gil Bellows',
    'https://image.tmdb.org/t/p/w45/bsh3cqDNwVvux4NdaY1Bj4S7mNS.jpg|Mark Rolston',
    'https://image.tmdb.org/t/p/w45/r1xOgXFjqhn2fonn78rlXKPZGFw.jpg|James Whitmore',
    'https://image.tmdb.org/t/p/w45/wMRlF3VRApPduQBAuNEVM4ncYcN.jpg|Jeffrey DeMunn',
    'https://image.tmdb.org/t/p/w45/3TGsmGFwJps4dmVncOZIO3p6ToO.jpg|Larry Brandenburg',
    'https://image.tmdb.org/t/p/w45/ujBzP61tYlwqWpB3oOxknl1XuEg.jpg|David Proval',
    'https://image.tmdb.org/t/p/w45/6nuAG4DVlCc0h2rfrbpJhdmKudx.jpg|Jude Ciccolella'
  ],
  'genre': [
    'Drama',
    'Crime'
  ],
  'popular': false,
  'objectID': '439817390'
};
