# Flarum Users Map Location - OpenStreetMap

Fork de [justoverclock/users-map-location](https://github.com/justoverclockl/users-map-location) remplaçant Mapbox par OpenStreetMap. Aucune clé API requise.

## Fonctionnalités

- Champ ville dans les Paramètres utilisateur (ou dans FoF Masquerade si installé, configurable)
- Géocodage automatique via Nominatim (lat/lon stockés en BDD)
- Carte de sa propre position dans les Paramètres
- Carte globale de tous les membres localisés, avec regroupement automatique des marqueurs proches (clustering)
- Page `/map` dédiée, accessible depuis n'importe où
- Endpoint API dédié (`/api/map-users`) sans limite de pagination
- Paramètres admin :
  - Hauteur de la carte (px)
  - Affichage en pleine largeur ou en container
  - Intégration dans FoF Masquerade (activable/désactivable)

## Installation

```bash
cd /path/to/flarum
composer config repositories.users-map-location-osm path extensions/users-map-location-osm
composer require waazdakka/users-map-location-osm:@dev
php flarum migrate
php flarum cache:clear
```

## Compilation JS (si modification des sources)

```bash
cd extensions/users-map-location-osm/js
npm install
npm run build
php /path/to/flarum/flarum cache:clear
```

## Note sur Nominatim

Cette extension utilise l'API publique [Nominatim](https://nominatim.org/) d'OpenStreetMap pour le géocodage. Merci de respecter leur [politique d'usage](https://operations.osmfoundation.org/policies/nominatim/) (1 requête/seconde) — ne pas utiliser cette extension pour des géocodages en masse ou à haute fréquence.

## Licence

MIT — Fork de [justoverclock/users-map-location](https://github.com/justoverclockl/users-map-location)
