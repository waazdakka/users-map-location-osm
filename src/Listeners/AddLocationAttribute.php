<?php

namespace Waazdakka\UsersMapLocationOsm\Listeners;

use Flarum\Api\Serializer\UserSerializer;
use Flarum\User\User;

class AddLocationAttribute
{
    public function __invoke(UserSerializer $serializer, User $user, array $attributes): array
    {
        $attributes['location'] = $user->location;
        $attributes['mapLat']   = $user->map_lat ? (float) $user->map_lat : null;
        $attributes['mapLon']   = $user->map_lon ? (float) $user->map_lon : null;
        return $attributes;
    }
}
