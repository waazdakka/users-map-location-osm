<?php
namespace Waazdakka\UsersMapLocationOsm;
use Waazdakka\UsersMapLocationOsm\Listeners\SaveLocationToDatabase;
use Waazdakka\UsersMapLocationOsm\Api\ListMapUsersController;
use Waazdakka\UsersMapLocationOsm\Api\UserResourceFields;
use Flarum\Api\Resource\UserResource;
use Flarum\Extend;
use Flarum\User\Event\Saving;
return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
        ->route('/map', 'members.map'),
    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),
    new Extend\Locales(__DIR__.'/locale'),
    (new Extend\Event())
        ->listen(Saving::class, SaveLocationToDatabase::class),
    (new Extend\ApiResource(UserResource::class))
        ->fields(UserResourceFields::class),
    (new Extend\Routes('api'))
        ->get('/map-users', 'map-users.index', ListMapUsersController::class),
    (new Extend\Settings())
        ->serializeToForum('waazdakkamap.mapHeight', 'waazdakka-map-height', 'strval', '500')
        ->serializeToForum('waazdakkamap.fullWidth', 'waazdakka-map-full-width', 'boolval', false)
        ->serializeToForum('waazdakkamap.useMasquerade', 'waazdakka-map-use-masquerade', 'boolval', true),
];
