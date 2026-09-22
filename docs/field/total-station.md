# មគ្គុទ្ទេសក៍វាលទី៥៖ Total Station និងការបញ្ជូនទិន្នន័យទៅ QGIS

Total Station វាស់មុំផ្ដេក មុំឈរ និងចម្ងាយ រួចគណនាកូអរដោនេ។ វាអាចវាស់ដោយ prism ឬ reflectorless តាមសមត្ថភាពឧបករណ៍។ លទ្ធផលដែលមានខ្ទង់ច្រើនមិនធានាគុណភាព បើ tripod, centering, backsight ឬកម្ពស់ឧបករណ៍ខុស។

<figure markdown>
--8<-- "assets/svg/field/total-station-setup.svg"
<figcaption>រូប វាល៥.១៖ Occupied point, backsight និង foresight បង្កើតទិសយោងសម្រាប់គណនាចំណុចថ្មី។</figcaption>
</figure>

## ១. ពាក្យស្នូល

| ពាក្យ | អត្ថន័យ |
|---|---|
| Occupied point | ចំណុចដែលដាក់ឧបករណ៍ មានកូអរដោនេស្គាល់ ឬក្នុងប្រព័ន្ធមូលដ្ឋាន |
| Instrument height (HI) | កម្ពស់ពីសញ្ញាចំណុចដល់អ័ក្សឧបករណ៍ |
| Backsight | ចំណុចទីពីរសម្រាប់កំណត់ទិស/orientation |
| Prism height (HR) | កម្ពស់សញ្ញាឆ្លុះពីចំណុចគោល |
| Foresight | ចំណុចដែលត្រូវវាស់ថ្មី |
| Prism constant | កែតម្លៃអុបទិករបស់ prism; ត្រូវតាមប្រភេទ prism |

## ២. Setup checklist

1. បោះ tripod ឱ្យមាំ និងកម្ពស់ងាយមើល។
2. Center លើ occupied point ហើយ level; ធ្វើ center/level ម្ដងទៀត ព្រោះការកែមួយអាចប៉ះមួយទៀត។
3. បញ្ចូល occupied coordinate, HI, prism type/constant និង HR។
4. Sight backsight និងកំណត់ orientation ពី coordinate ឬ azimuth ដែលបានពិនិត្យ។
5. វាស់ check point មួយដែលស្គាល់ មុនចាប់ផ្ដើម detail survey។
6. កត់ raw observation, code, operator, weather និង file name។

<div class="rich-sim" data-rich-sim="total-station"></div>

## ៣. Prism និង reflectorless

Prism សមសម្រាប់ចម្ងាយវែង និងគោលដៅដែលអាចដាក់បុគ្គល។ Reflectorless សមសម្រាប់ជញ្ជាំង កន្លែងគ្រោះថ្នាក់ ឬមិនអាចទៅដល់ ប៉ុន្តែអាចរងផលប៉ះពាល់ពីមុំប៉ះ ពណ៌/សំណើមផ្ទៃ និងវត្ថុរវាងផ្លូវកាំរស្មី។ កុំបាញ់ laser ទៅភ្នែក ឬផ្ទៃចរាចរណ៍ដែលអាចបង្កគ្រោះថ្នាក់។

## ៤. ការត្រួតពិនិត្យគុណភាព

- វាស់ backsight ឡើងវិញជាប្រចាំ និងមុនប្ដូរ station។
- វាស់ check point ពេលបញ្ចប់; គណនា closure មុនរើឧបករណ៍។
- បញ្ចូល code តាមបញ្ជីស្តង់ដារ (`BLDG`, `ROAD_EDGE`, `BM`)។
- កុំកែ raw file; កត់ចំណុចដែលសង្ស័យជាមួយមូលហេតុ។
- បែងចែក local coordinate និង national/project CRS ឱ្យច្បាស់។

## ៥. ពីឧបករណ៍ទៅ QGIS

Export CSV ដែលមាន `point_id, easting, northing, elevation, code, description`។ ពិនិត្យ delimiter និងខ្ទង់ទសភាគ។ ក្នុង QGIS ប្រើ **Add Delimited Text Layer**, ជ្រើស X=Easting, Y=Northing, CRS ត្រឹមត្រូវ រួច Save As GeoPackage។ Symbolize តាម code និងរក outlier/duplicate ID។ បើ coordinate ជាប្រព័ន្ធ local សូមកុំប្រកាសថាជា WGS84/UTM ដោយគ្មាន transformation។

!!! example "Worked check"
    Occupied point O និង backsight B មាន azimuth ដែលបានគណនា 40°00′00″។ ក្រោយវាស់ detail 20 ចំណុច អ្នកមើល B ម្ដងទៀតបាន 40°00′25″។ ការបែរទិស 25″ គឺសញ្ញាឱ្យពិនិត្យ stability និង tolerance របស់គម្រោង មុនទទួល detail ទាំងអស់។

## ៦. Mini challenge

ក្រុមមួយនាំ CSV ចូល QGIS ហើយចំណុចទៅក្បែរកូអរដោនេ 0°,0°។ លេខដើមប្រហែល E=500000, N=1280000។ រៀបលំដាប់ពិនិត្យ៖ X/Y, delimiter, CRS, unit, zone, header, ហើយសួរថាតើប្រព័ន្ធ local ឬ projected។ កុំ drag ចំណុចទៅកម្ពុជា។

??? question "ពិនិត្យចំណេះដឹង"
    - តើ backsight មានតួនាទីអ្វី? **កំណត់ទិសយោងរបស់ឧបករណ៍។**
    - HI ខុសប៉ះអ្វីជាចម្បង? **កម្ពស់/កូអរដោនេបញ្ឈរ និងការគណនាដែលពឹងកម្ពស់ឧបករណ៍។**
    - ហេតុអ្វីវាស់ check point? **ដើម្បីរក setup/orientation error មុនទិន្នន័យត្រូវប្រើ។**

