# កញ្ចប់អនុវត្ត offline

ពន្លា ZIP ទាំងមូល ហើយបើក `START_HERE.html`។ ទំព័រមេរៀន រូបភាព ពុម្ពអក្សរ សំណួរ និងពិសោធន៍អាចបើកដោយគ្មានអ៊ីនធឺណិត។ កុំបើកពីក្នុងកម្មវិធី ZIP ដោយមិនពន្លា។

## ទិន្នន័យតូចសម្រាប់ចាប់ផ្តើម

ទិន្នន័យបង្កើតថ្មីសម្រាប់សិក្សា៖ **ព្រំឃុំ និងលេខទាំងអស់ជាសំយោគ**។ ទីតាំងជិតកំពង់ឆ្នាំងគ្រាន់តែជាបរិបទ មិនតំណាងឃុំពិត ឬស្ថិតិរដ្ឋាភិបាល។

- [ពហុកោណឃុំសំយោគ 6](../assets/data/practice/synthetic_communes.geojson)
- [ចំណុចសេវា និងភ្លៀងសំយោគ](../assets/data/practice/synthetic_centres.geojson)
- [CSV សម្រាប់នាំចូល X/Y](../assets/data/practice/synthetic_centres.csv)
- [វចនានុក្រមវាល និងប្រភព](../assets/data/practice/README.txt)
- [DEM សំយោគដើម](../assets/data/lab-05/dem_sample_synthetic.tif)

GeoJSON ប្រើ WGS 84 ជា longitude, latitude។ CSV៖ X=`longitude`, Y=`latitude`, CRS=EPSG:4326។ សម្រាប់វាស់ផ្ទៃ ឬ interpolation រក្សាទុកច្បាប់ចម្លងទៅ EPSG:32648 ជាមុន។

| មេរៀន | សកម្មភាព | អ្វីដែលត្រូវពិនិត្យ |
|---|---|---|
| 1–3 | បញ្ចូល CSV និង Reproject | ចំនួន 6, X/Y, CRS និងទីតាំងត្រួតគ្នា |
| 4–5 | ចម្ងាយ និង contours ពី DEM | ឯកតាម៉ែត្រ, interval 20 ម, profile |
| 6–8 | Categorized លើ service; Graduated លើ population | Legend, class breaks, ពណ៌ និង hierarchy |
| 9 | បង្កើត area_km2 និង density | population / area_km2; កុំប្រើដឺក្រេការ៉េ |
| 10 | រង្វង់តាម population | កាំ ឬ diameter តាមឫសការ៉េ |
| 11 | IDW ពី rain_mm ក្នុង CRS ម៉ែត្រ | power 1/2, ទុកចំណុចមួយសម្រាប់ validation |
| 12 | coverage_2020 និង coverage_2025 | ព្រំថ្នាក់ 0,20,40,60,80,100 ដូចគ្នា |
| 13–14 | ស្លាក name និង Layout A4 | អក្សរខ្មែរ, មិនជាន់, scale bar ភ្ជាប់ Map |
| 15 | Export GeoJSON និង metadata | NULL ខុសពី 0, ឆ្នាំ/ប្រភព, វាលចេញផ្សាយ |

### ចម្លើយពិនិត្យ

ក្នុងពហុកោណ EPSG:32648 ប្រើ `area($geometry)/1000000` សម្រាប់ `area_km2` តាមប្លង់។ ប្រើ `CASE WHEN "area_km2" > 0 THEN "population" / "area_km2" END` សម្រាប់ density។ ប្រជាជនសរុប **42000** នាក់។ ឃុំ ខ កើនពី 40% ទៅ 60% = **20 ពិន្ទុភាគរយ**; relative increase = **50%**។ ឃុំ ឃ ឆ្នាំ 2025 ជា NULL។ ឃុំ ច ឆ្នាំ 2020 ជា 0 ដែលត្រូវបង្ហាញខុសពី NULL។

## ទិន្នន័យដើមពេញលេញ

លំហាត់ដើមខ្លះត្រូវការ `Cambodia.zip` ដែលមិនមាននៅក្នុង archive ដើម។ មើល [ឧបសម្ព័ន្ធទិន្នន័យកម្ពុជា](b-cambodia-data.md)។ ចម្លើយលេខថេរដើមពឹងលើកញ្ចប់នោះ។ កញ្ចប់សំយោគអនុញ្ញាតឲ្យហាត់វិធីសាស្ត្រដោយ offline ប៉ុន្តែមិនជំនួសស្ថិតិដើមទេ។

## សម្រាប់គ្រូ

ប្រើសិក្ខាសាលារូបភាពថ្មី 35–45 នាទីក្នុងប្លុកសកម្មភាពដែលមានស្រាប់។ ឲ្យនិស្សិតព្យាករណ៍មុនចុច រក្សាតារាងសង្កេត ហើយពន្យល់ភស្តុតាងជាគូ។ ពិន្ទុស្នើ 10៖ វិធីសាស្ត្រ 3, ភាពអាចអាន 3, ហេតុផល 2, ប្រភព និងដែនកំណត់ 2។ សំណួរ browser សម្រាប់ self-study; ចម្លើយមានក្នុង source ហើយមិនសម្រាប់ប្រឡងបិទសៀវភៅទេ។
