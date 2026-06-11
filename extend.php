<?php
namespace C4c6\UsersMapLocationOsm;
use C4c6\UsersMapLocationOsm\Listeners\SaveLocationToDatabase;
use C4c6\UsersMapLocationOsm\Listeners\AddLocationAttribute;
use C4c6\UsersMapLocationOsm\Api\ListMapUsersController;
use Flarum\Api\Serializer\UserSerializer;
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
    (new Extend\ApiSerializer(UserSerializer::class))
        ->attributes(AddLocationAttribute::class),
    (new Extend\Routes('api'))
        ->get('/map-users', 'map-users.index', ListMapUsersController::class),
    (new Extend\Settings())
        ->serializeToForum('c4c6map.mapHeight', 'c4c6-map-height', 'strval', '500')
        ->serializeToForum('c4c6map.fullWidth', 'c4c6-map-full-width', 'boolval', false)
        ->serializeToForum('c4c6map.useMasquerade', 'c4c6-map-use-masquerade', 'boolval', true),
];
