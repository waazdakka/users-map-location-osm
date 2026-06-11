import app from 'flarum/admin/app';

app.initializers.add('c4c6/users-map-location-osm', () => {
    app.extensionData
        .for('c4c6-users-map-location-osm')
        .registerSetting({
            setting: 'c4c6-map-height',
            label: 'Hauteur de la carte (px)',
            type: 'number',
            default: 500,
        })
        .registerSetting({
            setting: 'c4c6-map-full-width',
            label: 'Carte en pleine largeur',
            type: 'boolean',
            default: false,
        })
        .registerSetting({
            setting: 'c4c6-map-use-masquerade',
            label: 'Intégrer dans Masquerade si disponible',
            type: 'boolean',
            default: true,
        });
});
