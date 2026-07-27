import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';

function loadLeaflet() {
    return new Promise((resolve) => {
        if (window.L?.markerClusterGroup) { resolve(); return; }

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

        loadScript('leaflet-js', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
            .then(() => loadScript('leaflet-cluster-js', 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js'))
            .then(resolve);
    });
}

export default class StandaloneMapPage extends Page {
    oninit(vnode) {
        super.oninit(vnode);
        this.mapInstance = null;
        this.users = [];
        this.loading = true;

        app.request({
            method: 'GET',
            url: app.forum.attribute('apiUrl') + '/map-users',
        }).then(result => {
            this.users = result.data;
            this.loading = false;
            m.redraw();
            setTimeout(() => this.initMap(), 100);
        }).catch(() => { this.loading = false; m.redraw(); });
    }

    view() {
        const fullWidth = app.forum.attribute('waazdakkamap.fullWidth') === true;
        const mapHeight = app.forum.attribute('waazdakkamap.mapHeight') || 500;
        return (
            <div className={`StandaloneMapPage${fullWidth ? ' StandaloneMapPage--full' : ''}`}>
                <div className="StandaloneMapPage-header container">
                    <h2><i className="fas fa-map-marked-alt" /> Carte des membres</h2>
                    {!this.loading && (
                        <p className="helpText">
                            {this.users.length} membre{this.users.length > 1 ? 's' : ''} localisé{this.users.length > 1 ? 's' : ''}
                        </p>
                    )}
                </div>
                {this.loading
                    ? <LoadingIndicator />
                    : <div className={fullWidth ? '' : 'container'}>
                        <div id="osm-map-standalone" className="StandaloneMapPage-map" style={`height:${mapHeight}px`} />
                      </div>
                }
            </div>
        );
    }

    initMap() {
        const el = document.getElementById('osm-map-standalone');
        if (!el || this.mapInstance) return;

        loadLeaflet().then(() => {
            const el2 = document.getElementById('osm-map-standalone');
            if (!el2) return;
            this.mapInstance = L.map('osm-map-standalone').setView([46.5, 2.5], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
                referrerPolicy: 'strict-origin-when-cross-origin',
            }).addTo(this.mapInstance);

            const iconUrl = app.forum.attribute('baseUrl') + '/assets/extensions/waazdakka-users-map-location-osm/marker-icon.png';
            const icon = L.icon({ iconUrl, iconSize: [28, 45], iconAnchor: [14, 45] });
            const cluster = L.markerClusterGroup();
            const bounds = [];

            this.users.forEach(user => {
                const lat = user.lat;
                const lon = user.lon;
                bounds.push([lat, lon]);
                const popup = `<div style="text-align:center;min-width:120px;">
                    <strong><a href="${app.forum.attribute('baseUrl')}/u/${user.username}">${user.name}</a></strong><br/>
                    <small>${user.location}</small>
                </div>`;
                L.marker([lat, lon], { icon }).bindPopup(popup).addTo(cluster);
            });

            cluster.addTo(this.mapInstance);
            if (bounds.length) this.mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
            setTimeout(() => this.mapInstance && this.mapInstance.invalidateSize(), 300);
        });
    }

    onremove(vnode) {
        if (this.mapInstance) { this.mapInstance.remove(); this.mapInstance = null; }
        super.onremove(vnode);
    }
}
