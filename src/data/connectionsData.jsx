export default [
    {
        source: 'artist_1',
        target: 'artist_2',
        weight: 3,
        relationship: 'collaboration'
    },
    {
        source: 'artist_2',
        target: 'artist_3',
        weight: 2,
        relationship: 'shared_listeners'
    },
    {
        source: 'artist_1',
        target: 'artist_3',
        weight: 5,
        relationship: 'same_genre'
    }
];