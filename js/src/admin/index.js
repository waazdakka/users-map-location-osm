import app from 'flarum/admin/app';

app.initializers.add('waazdakka/users-map-location-osm', () => {
    app.registry
        .for('waazdakka-users-map-location-osm')
        .registerSetting({
            setting: 'waazdakka-map-height',
            label: 'Hauteur de la carte (px)',
            type: 'number',
            default: 500,
        })
        .registerSetting({
            setting: 'waazdakka-map-full-width',
            label: 'Carte en pleine largeur',
            type: 'boolean',
            default: false,
        })
        .registerSetting({
            setting: 'waazdakka-map-use-masquerade',
            label: 'Intégrer dans Masquerade si disponible',
            type: 'boolean',
            default: true,
        });
});
