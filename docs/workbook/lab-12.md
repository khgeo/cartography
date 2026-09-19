# លំហាត់ទី១២៖ ផែនទីលំហូរ និងផែនទីពីរអថេរ

!!! info "ព័ត៌មានលំហាត់"
    **មេរៀនពាក់ព័ន្ធ៖** [មេរៀនទី១២៖ ផែនទីលំហូរ ពហុអថេរ និងពេលវេលា](../lessons/lesson-12.md)
    **ការអនុវត្តដោយខ្លួនឯង** · QGIS 3.34 LTR · ប្រហែល ១០០ នាទី

## ស្ថានភាព

អ្នកត្រូវធ្វើផែនទីលំហូរពីខេត្តទៅរាជធានី និងផែនទីពីរអថេរ (ដង់ស៊ីតេ × អក្ខរកម្ម) សម្រាប់ខេត្តកំពង់ឆ្នាំង។

## គោលបំណង

- បង្កើតបន្ទាត់លំហូរពីតារាងគូទីតាំង (Origin-destination)។
- ធ្វើមាត្រដ្ឋានទទឹងបន្ទាត់តាមឫសការ៉េ និងត្រងលំហូរតូច។
- បង្កើតផែនទីពីរអថេរដោយប្រើវាលចាត់ថ្នាក់ និងពណ៌ ៩។
- ធ្វើផែនទីតូចច្រើនដោយ Atlas ឬប្លង់ច្រើន។

## ឯកសារដែលប្រើ

ប្រើសំណុំទិន្នន័យ `Cambodia` ([ឧបសម្ព័ន្ធ ខ](../appendix/b-cambodia-data.md))។

| ស្រទាប់ | ថត | វាល |
|---|---|---|
| `Kh_Province_Center` · `Kh_Province_Boundary` | `Admin/` | `Name_EN` `POP2017` |
| `Kh_Commune_area` | `Admin/` | |
| `Census_Commune` | `Census_2008/` | `TOTPOP` `T_LIT15` |

## ពិសោធន៍មុនចាប់ផ្ដើម · ១០ នាទី

<div class="sim" data-sim="flow"></div>

## សកម្មភាពទី១៖ តារាងលំហូរ · ២០ នាទី

1. បង្កើតឯកសារ `flows.csv` ដែលមានជួរឈរ `origin,destination,value` សម្រាប់ខេត្ត ១០ ទៅ «Phnom Penh»។ តម្លៃជាតម្លៃគំរូ (ឧទាហរណ៍ ១ ០០០ ដល់ ៤០ ០០០)។
2. នាំចូល `flows.csv` (Add Delimited Text Layer · No geometry)។
3. **Processing → Vector creation → Join by lines (hub lines)**៖ Hub layer `Kh_Province_Center` (ភ្នំពេញ) · Hub ID field `Name_EN` · Spoke layer `Kh_Province_Center` · Spoke ID `Name_EN` → `flow_lines`

    !!! tip "ជម្រើសផ្សេង"
        អាចប្រើ **Processing → Vector geometry → Points to path** ឬបង្កើតបន្ទាត់ដោយ Virtual layer ជាមួយ SQL `make_line()` ក៏បាន។

4. ភ្ជាប់តារាង `flows` ទៅ `flow_lines` តាមឈ្មោះខេត្ត។

## សកម្មភាពទី២៖ រចនាបន្ទាត់លំហូរ · ២៥ នាទី

1. Symbology → Simple Line → Stroke width → Data-defined override៖

    ```text
    0.02 * sqrt("value")
    ```

    (ឯកតា Millimeters · តម្លៃ ៤០ ០០០ → ៤,០ មម)

2. ពណ៌ទឹកក្រូច ភាពថ្លា ៤០% · Cap style **Round**។
3. បន្ថែម **Geometry generator** ដើម្បីបង្កើតបន្ទាត់កោង ឬប្រើ **Draw effects → Outer glow** ស្រាល ដើម្បីបំបែកបន្ទាត់ត្រួតគ្នា។
4. ត្រងលំហូរតូច៖ **Filter** `"value" >= 5000` ហើយសរសេរកម្រិតត្រងក្នុងកំណត់សម្គាល់។

## សកម្មភាពទី៣៖ ផែនទីពីរអថេរ · ២៥ នាទី

1. រៀបចំ `kc_communes` ជាមួយ `dens` និង `T_LIT15` ([លំហាត់ទី៩](lab-09.md))។
2. Field Calculator បង្កើតវាល `bi`៖

    ```text
    (CASE WHEN "dens" < 60 THEN 1 WHEN "dens" < 150 THEN 2 ELSE 3 END) * 10 +
    (CASE WHEN "T_LIT15" < 70 THEN 1 WHEN "T_LIT15" < 80 THEN 2 ELSE 3 END)
    ```

3. Symbology → **Categorized** លើ `bi` → ៩ ថ្នាក់ → កំណត់ពណ៌តាមក្រឡា ៩ (ឧទាហរណ៍ ColorBrewer bivariate ឬពណ៌ក្នុងពិសោធន៍ខាងក្រោម)។
4. បង្កើតសញ្ញាសម្គាល់ផែនទី ៣ × ៣ ក្នុង Print Layout ដោយប្រើ Add Shape (ក្រឡា ៩) និង Add Label។

<div class="sim" data-sim="bivariate"></div>

## សកម្មភាពទី៤៖ ផែនទីតូចច្រើន · ២០ នាទី

1. ធ្វើផែនទីពីរដាច់ដោយឡែក (ដង់ស៊ីតេ និងអក្ខរកម្ម) ដោយប្រើ **ព្រំថ្នាក់ដូចគ្នា** ក្នុងឯកតាដូចគ្នា។
2. ដាក់ផែនទីទាំងពីរក្នុងប្លង់តែមួយ ជាមួយចំណងជើងរង។
3. ប្រៀបធៀបជាមួយផែនទីពីរអថេរ។ មួយណាឆ្លើយសំណួរ «ឃុំណាមានទាំងពីរទាប?» លឿនជាង?

## លទ្ធផលត្រូវប្រគល់

- `flows.csv` `flow_lines` និងផែនទីលំហូរ PDF ជាមួយកំណត់សម្គាល់កម្រិតត្រង។
- ផែនទីពីរអថេរ ជាមួយសញ្ញាសម្គាល់ផែនទី ៣ × ៣។
- ប្លង់ផែនទីតូចច្រើន និងការប្រៀបធៀបមួយកថាខណ្ឌ។

## ពិនិត្យលទ្ធផលដោយខ្លួនឯង

អាចវាយលេខខ្មែរ ឬលេខអារ៉ាប់។

<div class="self-check" data-min="3.9" data-max="4.1" markdown>
**១.** ជាមួយកន្សោម `0.02 * sqrt(\"value\")` លំហូរ ៤០ ០០០ មានទទឹងប៉ុន្មាន មម?
</div>

<div class="self-check" data-min="1.9" data-max="2.1" markdown>
**២.** លំហូរ ១០ ០០០ មានទទឹងប៉ុន្មាន មម (ទសភាគ ១ ខ្ទង់)?
</div>

<div class="self-check" data-min="9" data-max="9" markdown>
**៣.** សញ្ញាសម្គាល់ផែនទីពីរអថេរ ៣ × ៣ មានក្រឡាប៉ុន្មាន?
</div>

<div class="self-check" data-min="69" data-max="69" markdown>
**៤.** ឃុំក្នុងខេត្តកំពង់ឆ្នាំងមានប៉ុន្មាន (សម្រាប់ផែនទីពីរអថេរ)?
</div>

<div class="self-check" data-answer="ព្រំថ្នាក់|class breaks|ព្រំថ្នាក់ និងពណ៌|breaks" markdown>
**៥.** តើត្រូវប្រើអ្វីឲ្យដូចគ្នា ពេលធ្វើផែនទីតូចច្រើន?
</div>

