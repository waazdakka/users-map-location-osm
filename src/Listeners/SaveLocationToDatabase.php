<?php

namespace C4c6\UsersMapLocationOsm\Listeners;

use Flarum\User\Event\Saving;
use Illuminate\Support\Arr;

class SaveLocationToDatabase
{
    public function handle(Saving $event)
    {
        $user = $event->user;
        $data = $event->data;
        $actor = $event->actor;

        $attributes = Arr::get($data, 'attributes', []);

        if (isset($attributes['location'])) {
            if ($actor->id !== $user->id) {
                $actor->assertPermission($actor->can('edit', $user));
            }

            $city = trim($attributes['location']);
            $user->location = $city;

            if ($city !== '') {
                $coords = $this->geocode($city);
                if ($coords) {
                    $user->map_lat = $coords['lat'];
                    $user->map_lon = $coords['lon'];
                }
            } else {
                $user->map_lat = null;
                $user->map_lon = null;
            }
        }
    }

    private function geocode(string $city): ?array
    {
        $url = 'https://nominatim.openstreetmap.org/search?q=' . urlencode($city) . '&format=json&limit=1';
        $ctx = stream_context_create(['http' => [
            'header' => "User-Agent: C4C6-Flarum-Extension/1.0\r\n",
            'timeout' => 5,
        ]]);
        try {
            $response = @file_get_contents($url, false, $ctx);
            if ($response === false) return null;
            $data = json_decode($response, true);
            if (!empty($data[0])) {
                return ['lat' => (float) $data[0]['lat'], 'lon' => (float) $data[0]['lon']];
            }
        } catch (\Exception $e) {}
        return null;
    }
}
