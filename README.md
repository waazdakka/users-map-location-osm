Flarum Users map location - Open Street Map

Fork de justoverclock/users-map-location remplaçant Mapbox par OpenStreetMap.
Aucune clé API requise.

## Fonctionnalités

- Champ ville dans les Paramètres utilisateur
- Géocodage automatique via Nominatim (lat/lon stockés en BDD)
- Carte de sa propre position dans les Paramètres
- Carte globale de tous les membres (bouton dans les Paramètres)
- Page `/map` accessible depuis n'importe où

## Installation

```bash
cd /var/www/flarum
composer config repositories.c4c6-map path extensions/users-map-location-osm
composer require c4c6/users-map-location-osm:@dev
php flarum migrate
php flarum cache:clear
```

## Compilation JS (si modification des sources)

```bash
cd extensions/users-map-location-osm/js
npm install
npm run build
php /var/www/flarum/flarum cache:clear
```

## Licence
MIT — Fork de justoverclock/users-map-location
