import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import Model from 'flarum/common/Model';
import User from 'flarum/common/models/User';
import LocationSettings from './components/LocationSettings';
import StandaloneMapPage from './components/StandaloneMapPage';

app.initializers.add('waazdakka/users-map-location-osm', () => {
    User.prototype.location = Model.attribute('location');
    User.prototype.mapLat   = Model.attribute('mapLat');
    User.prototype.mapLon   = Model.attribute('mapLon');

    app.routes['members.map'] = {
        path: '/map',
        component: StandaloneMapPage,
    };

    // Resolved through the export registry: the callback simply never fires when
    // Masquerade is not installed, so no presence guard is needed.
    extend('ext:fof/masquerade/forum/panes/ProfileConfigurePane', 'view', function (vnode) {
        // Lire le setting au moment du rendu, pas au boot
        if (app.forum.attribute('waazdakkamap.useMasquerade') !== false) {
            vnode.children.push(<LocationSettings user={this.attrs.user} />);
        }
    });

    // SettingsPage vit dans un chunk chargé à la demande en 2.0 : il faut l'étendre
    // par chemin de module, pas en important la classe.
    extend('flarum/forum/components/SettingsPage', 'settingsItems', function (items) {
        if (!('fof-masquerade' in flarum.extensions) || app.forum.attribute('waazdakkamap.useMasquerade') === false) {
            items.add('location', <LocationSettings />, 80);
        }
    });
});
