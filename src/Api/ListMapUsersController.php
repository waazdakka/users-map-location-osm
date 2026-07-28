<?php
namespace Waazdakka\UsersMapLocationOsm\Api;

use Flarum\Http\RequestUtil;
use Illuminate\Database\Capsule\Manager as DB;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class ListMapUsersController implements RequestHandlerInterface
{
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertCan('viewForum');

        // `nickname` is not a core column; it only exists with FoF Nicknames installed.
        $hasNickname = DB::connection()->getSchemaBuilder()->hasColumn('users', 'nickname');

        $columns = ['id', 'username', 'location', 'map_lat', 'map_lon', 'avatar_url'];

        if ($hasNickname) {
            $columns[] = 'nickname';
        }

        $users = DB::connection()
            ->table('users')
            ->whereNotNull('map_lat')
            ->whereNotNull('map_lon')
            ->where('map_lat', '!=', 0)
            ->select($columns)
            ->get();

        $data = $users->map(function ($user) use ($hasNickname) {
            $offset_lat = (($user->id * 7919) % 201 - 100) / 10000;
            $offset_lon = (($user->id * 6271) % 201 - 100) / 10000;
            return [
                'id'       => $user->id,
                'username' => $user->username,
                'name'     => ($hasNickname ? $user->nickname : null) ?: $user->username,
                'location' => $user->location,
                'lat'      => (float) $user->map_lat + $offset_lat,
                'lon'      => (float) $user->map_lon + $offset_lon,
                'avatar'   => $user->avatar_url,
            ];
        });

        return new JsonResponse(['data' => $data]);
    }
}
