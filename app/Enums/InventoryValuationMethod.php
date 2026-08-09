<?php

namespace App\Enums;

enum InventoryValuationMethod: string
{
    case MovingAverage = 'moving_average';
    case Fifo = 'fifo';
}
