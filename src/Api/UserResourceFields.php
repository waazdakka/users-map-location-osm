<?php

namespace Waazdakka\UsersMapLocationOsm\Api;

use Flarum\Api\Context;
use Flarum\Api\Schema;
use Flarum\User\User;

class UserResourceFields
{
    public function __invoke(): array
    {
        $canEdit = fn (User $user, Context $context) => $context->getActor()->id === $user->id
            || $context->getActor()->can('edit', $user);

        return [
            Schema\Str::make('location')
                ->nullable()
                ->writable($canEdit),

            // Read-only: written by the geocoder, never by the client.
            Schema\Number::make('mapLat')
                ->nullable()
                ->visible($canEdit)
                ->get(fn (User $user) => $user->map_lat !== null ? (float) $user->map_lat : null),

            Schema\Number::make('mapLon')
                ->nullable()
                ->visible($canEdit)
                ->get(fn (User $user) => $user->map_lon !== null ? (float) $user->map_lon : null),
        ];
    }
}
