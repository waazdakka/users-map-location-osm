<?php

namespace C4c6\UsersMapLocationOsm\Api;

use Flarum\Database\AbstractModel;
use Illuminate\Contracts\Database\Modeling\CastsAttributes;
use Illuminate\Database\Capsule\Manager as DB;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class ListMapUsersController implements RequestHandlerInterface
{
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $users = DB::connection()
            ->table('users')
            ->whereNotNull('map_lat')
            ->whereNotNull('map_lon')
            ->where('map_lat', '!=', 0)
            ->select(['id', 'username', 'nickname', 'location', 'map_lat', 'map_lon', 'avatar_url'])
            ->get();

        $data = $users->map(function ($user) {
            return [
                'id'       => $user->id,
                'username' => $user->username,
                'name'     => $user->nickname ?: $user->username,
                'location' => $user->location,
                'lat'      => (float) $user->map_lat,
                'lon'      => (float) $user->map_lon,
                'avatar'   => $user->avatar_url,
            ];
        });

        return new JsonResponse(['data' => $data]);
    }
}
