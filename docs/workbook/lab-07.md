# លំហាត់ទី៧៖ ចាត់ថ្នាក់ទិន្នន័យ និងប្រៀបធៀបផែនទី

!!! info "ព័ត៌មានលំហាត់"
    **មេរៀនពាក់ព័ន្ធ៖** [មេរៀនទី៧៖ ការចាត់ថ្នាក់ទិន្នន័យសម្រាប់ផែនទី](../lessons/lesson-07.md)
    **ការអនុវត្តដោយខ្លួនឯង** · QGIS 3.34 LTR · ប្រហែល ១០០ នាទី

## ស្ថានភាព

អ្នកត្រូវធ្វើផែនទីដង់ស៊ីតេប្រជាជនតាមខេត្ត សម្រាប់របាយការណ៍មួយ។ មុនជ្រើសវិធីចាត់ថ្នាក់ អ្នកនឹងសាកល្បងវិធីបួន ហើយប្រៀបធៀបលទ្ធផលដោយផ្អែកលើទិន្នន័យពិត។

## គោលបំណង

- អានស្ថិតិ និងក្រាបចែកចាយក្នុង QGIS។
- ប្រើ Graduated symbology ជាមួយវិធីចាត់ថ្នាក់ផ្សេងៗ។
- កំណត់ព្រំថ្នាក់ដោយដៃ ហើយរក្សាវាថេររវាងផែនទី។
- ប្រៀបធៀបផែនទី និងសរសេរហេតុផលនៃការជ្រើស។

## ឯកសារដែលប្រើ

ប្រើសំណុំទិន្នន័យ `Cambodia` ([ឧបសម្ព័ន្ធ ខ](../appendix/b-cambodia-data.md))។

| ស្រទាប់ | ថត | វាល |
|---|---|---|
| `Kh_Province_Boundary` | `Admin/` | `Density` `POP2017` `Area_Km2` |
| `Kh_Commune_area` | `Admin/` | `ProvGis` |
| `Census_Commune` | `Census_2008/` | `COMM_CODE` `TOTPOP` |

## ពិសោធន៍មុនចាប់ផ្ដើម · ១០ នាទី

<div class="sim" data-sim="classification"></div>

## សកម្មភាពទី១៖ មើលទិន្នន័យ · ២០ នាទី

1. បន្ថែម `Kh_Province_Boundary` ហើយបើក Attribute Table។ តម្រៀបតាម `Density`។
2. **Processing → Basic statistics for fields** លើ `Density`៖ កត់ត្រា count min max mean median និង standard deviation។
3. **Layer Properties → Histogram** (ក្នុងផ្ទាំង Symbology ជ្រើស Graduated រួចចុច Histogram) → ចុច **Load values**។
4. ឆ្លើយ៖ ការចែកចាយស៊ីមេទ្រី ឬលម្អៀង? តើមានតម្លៃខ្លាំង (outlier) ឬទេ?

## សកម្មភាពទី២៖ វិធីចាត់ថ្នាក់បួន · ៣០ នាទី

សម្រាប់វិធីនីមួយៗ៖ **Symbology → Graduated** · Value `Density` · Color ramp ពណ៌តែមួយ (ឧ. Reds) · Classes `5` · Mode តាមតារាង រួច **Classify**។

| Mode ក្នុង QGIS | វិធី | កត់ត្រា |
|---|---|---|
| Equal Interval | ចន្លោះស្មើ | ព្រំថ្នាក់ និងចំនួនខេត្តក្នុងថ្នាក់ទាបបំផុត |
| Quantile (Equal Count) | ចំនួនស្មើ | ព្រំថ្នាក់ |
| Natural Breaks (Jenks) | ចន្លោះធម្មជាតិ | ព្រំថ្នាក់ |
| Standard Deviation | គម្លាតគំរូ | មានថ្នាក់ទទេឬទេ? |

បន្ទាប់មក ថតរូបអេក្រង់ផែនទីនីមួយៗ (Project → Import/Export → Export Map to Image) ហើយដាក់ជាប់គ្នាក្នុងឯកសារមួយ។

!!! tip "រាប់ខេត្តក្នុងថ្នាក់"
    ចុចស្ដាំលើស្រទាប់ → **Show Feature Count** បន្ទាប់ពី Classify។ ចំនួនក្នុងថ្នាក់នីមួយៗនឹងបង្ហាញក្នុងផ្ទាំង Layers។

## សកម្មភាពទី៣៖ ព្រំថ្នាក់ដោយដៃ · ២០ នាទី

1. ក្នុងផ្ទាំង Graduated ចុចទ្វេដងលើតម្លៃព្រំ ដើម្បីកែ។ កំណត់ព្រំ៖ `0–49` · `50–99` · `100–199` · `200–499` · `500+`។
2. កែស្លាកថ្នាក់ឲ្យមានឯកតា ឧទាហរណ៍ «០–៤៩ នាក់/គម²»។
3. រក្សាទុករចនាប័ទ្មជា `density_manual.qml` (ចុចស្ដាំលើស្រទាប់ → Export → Save as QGIS Layer Style File)។

**សំណួរ៖** ហេតុអ្វីព្រំកំណត់ដោយដៃមានប្រយោជន៍ ពេលអ្នកត្រូវធ្វើផែនទីច្រើនឆ្នាំ?

## សកម្មភាពទី៤៖ ចាត់ថ្នាក់ទិន្នន័យកម្រិតឃុំ · ២០ នាទី

1. **Extract by expression** លើ `Kh_Commune_area`៖ `"ProvGis" = 'KH04'` → `kc_communes`
2. ភ្ជាប់ `Census_Commune` តាមវិធីក្នុង[លំហាត់ទី៥ សៀវភៅទី២](https://khgeo.github.io/gis-fundamentals/workbook/lab-05/) (វាល `'KH' || "COMM_CODE"`)។
3. Field Calculator៖ `dens = "TOTPOP" / ($area / 1000000)`
4. ធ្វើផែនទី Graduated ៥ ថ្នាក់ ជាមួយ Natural Breaks រួចម្ដងទៀតជាមួយ Quantile។ ប្រៀបធៀបលំនាំ។

**សំណួរ៖** ការចាត់ថ្នាក់កម្រិតឃុំ បង្ហាញលំនាំដែលកម្រិតខេត្តលាក់ឬទេ? សរសេរ ២ ទៅ ៣ ប្រយោគ។

## សកម្មភាពទី៥៖ ជ្រើស និងពន្យល់ · ១០ នាទី

ជ្រើសផែនទីមួយសម្រាប់របាយការណ៍ ហើយសរសេរកថាខណ្ឌមួយ៖ វិធីចាត់ថ្នាក់ ចំនួនថ្នាក់ ហេតុផល និងអ្វីដែលអ្នកអានគួរប្រុងប្រយ័ត្ន។

## លទ្ធផលត្រូវប្រគល់

- តារាងស្ថិតិ និងរូបភាពក្រាបចែកចាយ។
- រូបភាពផែនទី ៤ ជាមួយព្រំថ្នាក់។
- `density_manual.qml` និងផែនទីកម្រិតឃុំ។
- កថាខណ្ឌពន្យល់ការជ្រើស។

## ពិនិត្យលទ្ធផលដោយខ្លួនឯង

អាចវាយលេខខ្មែរ ឬលេខអារ៉ាប់។

<div class="self-check" data-min="2049" data-max="2049" data-hint="Basic statistics for fields" markdown>
**១.** ដង់ស៊ីតេអតិបរមាក្នុងចំណោមខេត្ត (នាក់/គម²)?
</div>

<div class="self-check" data-min="6" data-max="6" markdown>
**២.** ដង់ស៊ីតេអប្បបរមា?
</div>

<div class="self-check" data-min="102" data-max="106" markdown>
**៣.** មធ្យមភាគ (median) នៃដង់ស៊ីតេ?
</div>

<div class="self-check" data-min="24" data-max="24" markdown>
**៤.** ជាមួយ Equal Interval ៥ ថ្នាក់ តើខេត្តប៉ុន្មានធ្លាក់ក្នុងថ្នាក់ទាបបំផុត?
</div>

<div class="self-check" data-min="5" data-max="5" markdown>
**៥.** ជាមួយ Quantile ៥ ថ្នាក់ តើខេត្តប៉ុន្មានក្នុងមួយថ្នាក់?
</div>

