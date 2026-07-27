<?php
namespace C4c6\UsersMapLocationOsm\Api;
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
            $offset_lat = (($user->id * 7919) % 201 - 100) / 10000;
            $offset_lon = (($user->id * 6271) % 201 - 100) / 10000;
            return [
                'id'       => $user->id,
                'username' => $user->username,
                'name'     => $user->nickname ?: $user->username,
                'location' => $user->location,
                'lat'      => (float) $user->map_lat + $offset_lat,
                'lon'      => (float) $user->map_lon + $offset_lon,
                'avatar'   => $user->avatar_url,
            ];
        });
        return new JsonResponse(['data' => $data]);
    }
}
