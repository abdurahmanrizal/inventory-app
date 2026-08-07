<?php

namespace App\Http\Controllers;

use App\Models\InventorySetting;
use App\Services\InventoryReportExport;
use App\Services\InventoryReportService;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InventoryReportController extends Controller
{
    public function __invoke(Request $request, InventoryReportService $reports): Response
    {
        [$report, $filters, $context, $data] = $this->reportData($request, $reports);

        return Inertia::render('Reports/Index', [
            'report' => $report,
            'data' => $data,
            'filters' => $filters,
            'warehouses' => $context['warehouses'],
            'items' => $reports->items($context['warehouseIds']),
            'canFilterWarehouse' => $context['canFilterWarehouse'],
            'accessLabel' => $context['accessLabel'],
            'valuationMethod' => InventorySetting::current()->valuation_method->value,
        ]);
    }

    public function export(Request $request, string $format, InventoryReportService $reports, InventoryReportExport $export): HttpResponse
    {
        abort_unless(in_array($format, ['pdf', 'xlsx'], true), 404);
        [$report, $filters, $context, $data] = $this->reportData($request, $reports);
        $warehouseName = $context['warehouseId']
            ? $context['warehouses']->firstWhere('id', $context['warehouseId'])?->name
            : $context['accessLabel'];
        $filename = 'laporan-'.$report.'-'.now()->format('Ymd-His');

        if ($format === 'xlsx') {
            return response($export->xlsx($report, $data, $filters, $warehouseName), 200, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="'.$filename.'.xlsx"',
            ]);
        }

        $options = new Options;
        $options->set('defaultFont', 'DejaVu Sans');
        $options->set('isRemoteEnabled', false);
        $pdf = new Dompdf($options);
        [$headers, $rows] = $export->table($report, $data);
        $title = $export->title($report);
        $pdf->loadHtml(view('documents.inventory-report', compact('title', 'headers', 'rows', 'filters', 'warehouseName'))->render());
        $pdf->setPaper('A4', 'landscape');
        $pdf->render();

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'.pdf"',
        ]);
    }

    private function reportData(Request $request, InventoryReportService $reports): array
    {
        $filters = $request->validate([
            'report' => ['nullable', Rule::in(['ledger', 'slow-moving', 'opname', 'valuation', 'cost-history', 'financial-movement', 'issue-cost', 'valuation-audit', 'anomalies', 'purchase-history'])],
            'warehouse_id' => ['nullable', 'integer'],
            'item_id' => ['nullable', 'integer', 'exists:items,id'],
            'batch_no' => ['nullable', 'string', 'max:100'],
            'supplier_name' => ['nullable', 'string', 'max:150'],
            'search' => ['nullable', 'string', 'max:100'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'days' => ['nullable', 'integer', Rule::in([30, 60, 90, 180, 365])],
        ]);

        $report = $filters['report'] ?? 'ledger';
        $filters['date_from'] ??= now()->startOfMonth()->format('Y-m-d');
        $filters['date_to'] ??= now()->format('Y-m-d');
        $filters['days'] = (int) ($filters['days'] ?? 90);
        $context = $reports->context($request->user(), isset($filters['warehouse_id']) ? (int) $filters['warehouse_id'] : null);

        $data = match ($report) {
            'slow-moving' => $reports->slowMoving($context['warehouseIds'], $context['warehouseId'], $filters['days']),
            'opname' => $reports->opname($context['warehouseIds'], $context['warehouseId'], $filters),
            'valuation' => $reports->valuation($context['warehouseIds'], $context['warehouseId']),
            'cost-history' => $reports->costHistory($context['warehouseIds'], $context['warehouseId'], $filters),
            'financial-movement' => $reports->financialMovement($context['warehouseIds'], $context['warehouseId'], $filters),
            'issue-cost' => $reports->issueCost($context['warehouseIds'], $context['warehouseId'], $filters),
            'valuation-audit' => $reports->valuationAudit($context['warehouseIds'], $context['warehouseId'], $filters),
            'anomalies' => $reports->anomalies($context['warehouseIds'], $context['warehouseId']),
            'purchase-history' => $reports->purchaseHistory($context['warehouseIds'], $context['warehouseId'], $filters),
            default => $reports->stockLedger($context['warehouseIds'], $context['warehouseId'], $filters),
        };

        return [$report, $filters, $context, $data];
    }
}
