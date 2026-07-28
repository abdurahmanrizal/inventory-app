<?php

namespace App\Services;

use RuntimeException;
use SimpleXMLElement;
use ZipArchive;

class ItemImportWorkbook
{
    /**
     * @param  array<int, array{code: string, name: string}>  $uoms
     */
    public function create(array $uoms): string
    {
        $path = tempnam(sys_get_temp_dir(), 'item-import-');
        $zip = new ZipArchive;
        if ($path === false || $zip->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('Template Excel tidak dapat dibuat.');
        }

        $uoms = array_values($uoms);
        $lastUomRow = max(2, count($uoms) + 1);
        $zip->addFromString('[Content_Types].xml', $this->contentTypes());
        $zip->addFromString('_rels/.rels', $this->packageRelationships());
        $zip->addFromString('xl/workbook.xml', $this->workbook($lastUomRow));
        $zip->addFromString('xl/_rels/workbook.xml.rels', $this->workbookRelationships());
        $zip->addFromString('xl/styles.xml', $this->styles());
        $zip->addFromString('xl/worksheets/sheet1.xml', $this->itemSheet());
        $zip->addFromString('xl/worksheets/sheet2.xml', $this->uomSheet($uoms));
        $zip->close();

        $contents = file_get_contents($path);
        unlink($path);
        if ($contents === false) {
            throw new RuntimeException('Template Excel tidak dapat dibaca.');
        }

        return $contents;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function rows(string $path): array
    {
        $zip = new ZipArchive;
        if ($zip->open($path) !== true) {
            throw new RuntimeException('File Excel tidak dapat dibuka.');
        }

        try {
            $sharedStrings = $this->sharedStrings($zip);
            $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
            if ($sheetXml === false) {
                throw new RuntimeException('Sheet data item tidak ditemukan.');
            }

            $sheet = simplexml_load_string($sheetXml);
            if (! $sheet instanceof SimpleXMLElement) {
                throw new RuntimeException('Isi file Excel tidak valid.');
            }

            $rawRows = [];
            foreach ($sheet->sheetData->row as $row) {
                $values = [];
                foreach ($row->c as $cell) {
                    $reference = (string) $cell['r'];
                    preg_match('/^[A-Z]+/', $reference, $matches);
                    $column = $matches[0] ?? '';
                    $type = (string) $cell['t'];
                    $value = match ($type) {
                        'inlineStr' => (string) $cell->is->t,
                        's' => $sharedStrings[(int) $cell->v] ?? '',
                        default => (string) $cell->v,
                    };
                    $values[$column] = $value;
                }
                $rawRows[] = $values;
            }
        } finally {
            $zip->close();
        }

        if ($rawRows === []) {
            return [];
        }

        $headers = [];
        foreach ($rawRows[0] as $column => $value) {
            $headers[$column] = strtolower(trim((string) $value));
        }

        return collect(array_slice($rawRows, 1))
            ->map(fn (array $row) => collect($headers)->mapWithKeys(
                fn (string $header, string $column) => [$header => $row[$column] ?? null]
            )->all())
            ->filter(fn (array $row) => collect($row)->contains(fn ($value) => trim((string) $value) !== ''))
            ->values()->all();
    }

    private function itemSheet(): string
    {
        $headers = ['name', 'base_uom', 'warehouse_type', 'min_stock', 'issue_method', 'has_batch', 'has_expired', 'is_active'];
        $example = ['Gula Pasir', 'KG', 'dry', 10, 'fifo', 1, 0, 1];
        $columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        $headerCells = $this->cells($headers, $columns, 1, 1);
        $exampleCells = $this->cells($example, $columns, 2, 0);

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
            .'<cols><col min="1" max="1" width="28" customWidth="1"/>'
            .'<col min="2" max="3" width="18" customWidth="1"/><col min="4" max="8" width="16" customWidth="1"/></cols>'
            .'<sheetData><row r="1" ht="24" customHeight="1">'.$headerCells.'</row><row r="2">'.$exampleCells.'</row></sheetData>'
            .'<autoFilter ref="A1:H1001"/>'
            .'<dataValidations count="5">'
            .'<dataValidation type="list" allowBlank="0" showErrorMessage="1" errorTitle="Satuan tidak valid" error="Pilih satuan dari daftar master satuan." sqref="B2:B1001"><formula1>UOM_OPTIONS</formula1></dataValidation>'
            .'<dataValidation type="list" allowBlank="0" sqref="C2:C1001"><formula1>"dry,wet,both"</formula1></dataValidation>'
            .'<dataValidation type="list" allowBlank="0" sqref="E2:E1001"><formula1>"manual,fifo,fefo"</formula1></dataValidation>'
            .'<dataValidation type="list" allowBlank="0" sqref="F2:H1001"><formula1>"0,1"</formula1></dataValidation>'
            .'<dataValidation type="decimal" operator="greaterThanOrEqual" allowBlank="0" sqref="D2:D1001"><formula1>0</formula1></dataValidation>'
            .'</dataValidations></worksheet>';
    }

    /**
     * @param  array<int, array{code: string, name: string}>  $uoms
     */
    private function uomSheet(array $uoms): string
    {
        $rows = '<row r="1">'.$this->cells(['Kode', 'Nama Satuan'], ['A', 'B'], 1, 1).'</row>';
        foreach ($uoms as $index => $uom) {
            $row = $index + 2;
            $rows .= '<row r="'.$row.'">'.$this->cells([$uom['code'], $uom['name']], ['A', 'B'], $row, 0).'</row>';
        }

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>'
            .'<col min="1" max="1" width="16" customWidth="1"/><col min="2" max="2" width="28" customWidth="1"/>'
            .'</cols><sheetData>'.$rows.'</sheetData></worksheet>';
    }

    private function cells(array $values, array $columns, int $row, int $style): string
    {
        return collect($values)->map(function ($value, $index) use ($columns, $row, $style) {
            $reference = $columns[$index].$row;
            if (is_int($value) || is_float($value)) {
                return '<c r="'.$reference.'" s="'.$style.'"><v>'.$value.'</v></c>';
            }

            return '<c r="'.$reference.'" s="'.$style.'" t="inlineStr"><is><t>'
                .htmlspecialchars((string) $value, ENT_XML1 | ENT_QUOTES, 'UTF-8').'</t></is></c>';
        })->implode('');
    }

    private function sharedStrings(ZipArchive $zip): array
    {
        $xml = $zip->getFromName('xl/sharedStrings.xml');
        if ($xml === false) {
            return [];
        }

        $strings = simplexml_load_string($xml);
        if (! $strings instanceof SimpleXMLElement) {
            return [];
        }

        return collect($strings->xpath('//*[local-name()="si"]') ?: [])
            ->map(function (SimpleXMLElement $item): string {
                $textNodes = $item->xpath('.//*[local-name()="t"]') ?: [];

                return collect($textNodes)->map(fn (SimpleXMLElement $text) => (string) $text)->implode('');
            })
            ->all();
    }

    private function workbook(int $lastUomRow): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            .'<sheets><sheet name="Master Item" sheetId="1" r:id="rId1"/><sheet name="Master Satuan" sheetId="2" state="hidden" r:id="rId2"/></sheets>'
            .'<definedNames><definedName name="UOM_OPTIONS">\'Master Satuan\'!$A$2:$A$'.$lastUomRow.'</definedName></definedNames>'
            .'</workbook>';
    }

    private function styles(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts>'
            .'<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF059669"/><bgColor indexed="64"/></patternFill></fill>'
            .'<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
            .'<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            .'<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"><alignment horizontal="center"/></xf></cellXfs>'
            .'</styleSheet>';
    }

    private function contentTypes(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            .'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            .'<Default Extension="xml" ContentType="application/xml"/>'
            .'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            .'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            .'<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            .'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            .'</Types>';
    }

    private function packageRelationships(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            .'</Relationships>';
    }

    private function workbookRelationships(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            .'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>'
            .'<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            .'</Relationships>';
    }
}
