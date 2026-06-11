import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import Model from 'flarum/common/Model';
import User from 'flarum/common/models/User';
import SettingsPage from 'flarum/forum/components/SettingsPage';
import LocationSettings from './components/LocationSettings';
import StandaloneMapPage from './components/StandaloneMapPage';

app.initializers.add('c4c6/users-map-location-osm', () => {
    User.prototype.location = Model.attribute('location');
    User.prototype.mapLat   = Model.attribute('mapLat');
    User.prototype.mapLon   = Model.attribute('mapLon');

    app.routes['members.map'] = {
        path: '/map',
        component: StandaloneMapPage,
    };

    const masquerade = flarum.extensions['fof-masquerade'];

    if (masquerade) {
        const { ProfileConfigurePane } = masquerade.panes;
        extend(ProfileConfigurePane.prototype, 'view', function (vnode) {
            // Lire le setting au moment du rendu, pas au boot
            if (app.forum.attribute('c4c6map.useMasquerade') !== false) {
                vnode.children.push(<LocationSettings user={this.attrs.user} />);
            }
        });
    }

    // Toujours enregistrer le fallback Settings aussi
    extend(SettingsPage.prototype, 'settingsItems', function (items) {
        if (!flarum.extensions['fof-masquerade'] || app.forum.attribute('c4c6map.useMasquerade') === false) {
            items.add('location', <LocationSettings />, 80);
        }
    });
});
