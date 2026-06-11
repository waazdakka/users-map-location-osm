<?php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;
return [
    'up' => function (Builder $schema) {
        if (!$schema->hasColumn('users', 'location')) {
            $schema->table('users', function (Blueprint $table) {
                $table->text('location')->nullable();
            });
        }
        if (!$schema->hasColumn('users', 'map_lat')) {
            $schema->table('users', function (Blueprint $table) {
                $table->decimal('map_lat', 10, 7)->nullable();
                $table->decimal('map_lon', 10, 7)->nullable();
            });
        }
    },
    'down' => function (Builder $schema) {},
];
