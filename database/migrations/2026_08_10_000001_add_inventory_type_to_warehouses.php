<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('warehouses', function (Blueprint $table) {
            $table->string('inventory_type', 10)->nullable()->after('type')->index();
        });

        DB::table('warehouses')->where('type', 'main')
            ->where(fn ($query) => $query->where('name', 'like', '%kering%')->orWhere('code', 'like', '%dry%'))
            ->update(['inventory_type' => 'dry']);
        DB::table('warehouses')->where('type', 'main')
            ->where(fn ($query) => $query->where('name', 'like', '%basah%')->orWhere('code', 'like', '%wet%'))
            ->update(['inventory_type' => 'wet']);
    }

    public function down(): void
    {
        Schema::table('warehouses', function (Blueprint $table) {
            $table->dropIndex(['inventory_type']);
            $table->dropColumn('inventory_type');
        });
    }
};
