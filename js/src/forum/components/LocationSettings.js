import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';

function loadLeaflet() {
    return new Promise((resolve) => {
        if (window.L && window.L.markerClusterGroup) { resolve(); return; }

        const promises = [];

        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css'; link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        if (!document.getElementById('leaflet-cluster-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-cluster-css'; link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
            document.head.appendChild(link);
        }

        const loadScript = (id, src) => new Promise((res) => {
            if (document.getElementById(id)) { res(); return; }
            const script = document.createElement('script');
            script.id = id; script.src = src;
            script.onload = res;
            document.head.appendChild(script);
        });

        Promise.all([
            loadScript('leaflet-js', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'),
        ]).then(() => {
            loadScript('leaflet-cluster-js', 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js')
                .then(resolve);
        });
    });
}

export default class LocationSettings extends Component {
    oninit(vnode) {
        super.oninit(vnode);
        const user = this.attrs.user || app.session.user;
        this.locationValue = user.location() || '';
        this.saving = false;
        this.mapInstance = null;
        this.globalMapInstance = null;
        this.globalUsers = [];
	this.globalLoading = false;
	this.showGlobal = false;
    }

    view() {
        const user = this.attrs.user || app.session.user;
        const hasCoords = user.mapLat && user.mapLat();

        return (
	    <fieldset className="Settings-theme" style="margin-top: 20px;">
                <legend><i className="fas fa-map-marked-alt" /> Localisation</legend>

                <div className="Form-group">
                    <label>Votre ville</label>
                    <div style="display:flex; gap:10px; align-items:center; margin-bottom:8px;">
                        <input
                            type="text"
                            className="FormControl"
                            placeholder="Ex: Paris, Lyon, Bordeaux..."
                            value={this.locationValue}
                            oninput={(e) => { this.locationValue = e.target.value; }}
                            style="max-width:300px;"
                        />
                        <Button className="Button Button--primary" loading={this.saving} onclick={() => this.save()}>
                            Enregistrer
                        </Button>
                    </div>
                    <p className="helpText">Entrez votre ville pour apparaître sur la carte des membres.</p>
                </div>

                {hasCoords && (
                    <div className="Form-group">
                        <label>Votre position</label>
                        <div id="osm-map-settings" style="width:100%; height:220px; border-radius:8px; overflow:hidden;" />
                    </div>
                )}

                <div className="Form-group">
                    <label>Carte des membres</label>
                    {!this.showGlobal ? (
                        <Button className="Button" onclick={() => this.openGlobalMap()}>
                            <i className="fas fa-globe" /> Afficher la carte des membres
                        </Button>
                    ) : this.globalLoading ? (
                        <p>Chargement...</p>
                    ) : (
                        <div>
                            <p className="helpText" style="margin-bottom:8px;">
                                {this.globalUsers.length} membre{this.globalUsers.length > 1 ? 's' : ''} localisé{this.globalUsers.length > 1 ? 's' : ''}
                            </p>
			    <div id="osm-map-global" style={`width:100%; height:${app.forum.attribute('waazdakkamap.mapHeight') || 500}px; border-radius:8px; overflow:hidden;`} />
                        </div>
                    )}
                </div>
            </fieldset>
        );
    }

    oncreate(vnode) {
        super.oncreate(vnode);
        this.initPersonalMap();
    }

    onupdate(vnode) {
        super.onupdate(vnode);
        const user = this.attrs.user || app.session.user;
        if (!this.mapInstance && user.mapLat && user.mapLat()) {
            this.initPersonalMap();
        }
        if (this.showGlobal && !this.globalMapInstance && !this.globalLoading && this.globalUsers.length) {
            this.initGlobalMap();
        }
    }

    onremove(vnode) {
        if (this.mapInstance) { this.mapInstance.remove(); this.mapInstance = null; }
        if (this.globalMapInstance) { this.globalMapInstance.remove(); this.globalMapInstance = null; }
        super.onremove(vnode);
    }

    initPersonalMap() {
        const user = this.attrs.user || app.session.user;
        const lat = user.mapLat && user.mapLat();
        const lon = user.mapLon && user.mapLon();
        if (!lat || !lon) return;
        const el = document.getElementById('osm-map-settings');
        if (!el) return;

        loadLeaflet().then(() => {
            if (this.mapInstance) { this.mapInstance.remove(); this.mapInstance = null; }
            const el2 = document.getElementById('osm-map-settings');
            if (!el2) return;
            this.mapInstance = L.map('osm-map-settings').setView([lat, lon], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
		referrerPolicy: 'strict-origin-when-cross-origin',
            }).addTo(this.mapInstance);
            const iconUrl = app.forum.attribute('baseUrl') + '/assets/extensions/waazdakka-users-map-location-osm/marker-icon.png';
            const icon = L.icon({ iconUrl, iconSize: [28, 45], iconAnchor: [14, 45] });
            L.marker([lat, lon], { icon }).addTo(this.mapInstance).bindPopup(user.location()).openPopup();
            setTimeout(() => this.mapInstance && this.mapInstance.invalidateSize(), 300);
        });
    }

    openGlobalMap() {
        this.showGlobal = true;
        this.globalLoading = true;
        m.redraw();

        app.request({
            method: 'GET',
            url: app.forum.attribute('apiUrl') + '/map-users',
        }).then(result => {
            this.globalUsers = result.data;
            this.globalLoading = false;
            m.redraw();
            setTimeout(() => this.initGlobalMap(), 100);
        }).catch(() => {
            this.globalLoading = false;
            m.redraw();
        });
    }

    initGlobalMap() {
        const el = document.getElementById('osm-map-global');
        if (!el || this.globalMapInstance) return;
        loadLeaflet().then(() => {
            const el2 = document.getElementById('osm-map-global');
            if (!el2) return;
            this.globalMapInstance = L.map('osm-map-global').setView([46.5, 2.5], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
                referrerPolicy: 'strict-origin-when-cross-origin',
            }).addTo(this.globalMapInstance);
            const iconUrl = app.forum.attribute('baseUrl') + '/assets/extensions/waazdakka-users-map-location-osm/marker-icon.png';
            const icon = L.icon({ iconUrl, iconSize: [28, 45], iconAnchor: [14, 45] });
            const cluster = L.markerClusterGroup();
            const bounds = [];
            this.globalUsers.forEach(user => {
                const lat = user.lat;
                const lon = user.lon;
                bounds.push([lat, lon]);
                const popup = `<div style="text-align:center;min-width:120px;">
                    <strong><a href="${app.forum.attribute('baseUrl')}/u/${user.username}">${user.name}</a></strong><br/>
                    <small>${user.location}</small>
                </div>`;
                L.marker([lat, lon], { icon }).bindPopup(popup).addTo(cluster);
            });
            cluster.addTo(this.globalMapInstance);
            if (bounds.length) this.globalMapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
            setTimeout(() => this.globalMapInstance && this.globalMapInstance.invalidateSize(), 300);
        });
    }

    save() {
        this.saving = true;
        m.redraw();
        const user = this.attrs.user || app.session.user;
        user.save({ location: this.locationValue.trim() }).then(() => {
            this.saving = false;
            if (this.mapInstance) { this.mapInstance.remove(); this.mapInstance = null; }
            app.alerts.show({ type: 'success' }, 'Localisation enregistrée !');
            app.store.find('users', user.id()).then(() => {
                if (this.globalMapInstance) { this.globalMapInstance.remove(); this.globalMapInstance = null; }
                this.globalUsers = [];
                this.showGlobal = false;
                m.redraw();
                setTimeout(() => this.initPersonalMap(), 200);
            });
        }).catch(() => {
            this.saving = false;
            m.redraw();
        });
    }
}
