#  ** Project-3-Group-8: _Victoria Housing Median Price Change from 2011-2021_ **
** Project Members:** Selina Matthews | Shaun Xu | Haodong Zhang \
** Datasource Link:** https://discover.data.vic.gov.au/dataset/victorian-property-sales-report-median-house-by-suburb-time-series1/historical
                      https://www.rba.gov.au/statistics/
                      https://www.wsj.com/market-data/quotes/index/AU/XJO/historical-prices

## **Project Description / Outline**
This project will reveal the relationship between Victoria Property Sales Record and the Australian Economic status. Usually, when the bank's interest rates increase, the property price could decrease due to less buying power of the public. However, this is only sometimes the case for some suburbs. This project will mainly focus on the relationship between Median Property Sales Records and Australian Reserve Bank’s Interest Rate. Also will compare the ASX trending and inflation rates during the same period. Through this analysis and visualisation, it would be easier for us to explain which suburbs are most valuable for investment.

### **GitHub Repository Description**
* **Primary Script:** dataPrepare.ipynb & dataPrepare_interestRate.ipynb & app.py
* **Secondary Script:** /static
* **Third Script:** / Realeaste.ipynb
* **Resource Files:** /Resources
* **Output Files:** /app.py - http://127.0.0.1:5000/ & listings.csv
* **PowerPoint:** Victoria Housing Median Price Change from 2011-2021

### **Research Questions**
Basic Data Summary - analysis by Interest Rate/Inflation Rate/ASX 200
1. The dataset has fairly wide range of records
2. Based on this dataset, Interest Rate has bigger impact on Housing Median Price
3. The northern and eastern suburbs have stronger increase rate in past 10 years

** Data manipulation:
There are 4 financial datasets to process and 1 geojson dataset. In the back end, we use the Python and Pandas to clean and filte all datasets which downloaded from office website. We create two Python scripts to explore data, one is for house median dataset, keep most data on original file and generate more growth rates. The other one is for inflation, interest and S&P/AS200 dataset. In the end finally, we save all data to sqlite database, house.sqlite and interest_rate.sqlite. In the front end, we use sql.js, a new javascript library to read datasets from sqlite database we saved. Because median house dataset provided by Victorian Government Open Data only have 820 suburbs, and Victoria have more than 2900 suburbs actually. So the choropleth map will have some blank region.

** Visualisations:
We made a beautiful dashboard to show map, median house price, growth rate and other trends, such as interest rate, inflation, S&P/AS200. According suburb geojson dataset, We make a choropleth map to show the median price of each suburb for every year, and show 10-year total growth, growth per annaul and every year. When user click the suburb of map, there is a popup to show suburb name and median price or growth rate. Additionlly, this popup window create a button. Once button is clicked, the dashboard will show that suburb median house detail. User can change the year and period selector to choose concerned dataset, the choropleth map and the trend line chart will follow the change. User also can change the suburb name to choose a suburb to check it’s dataset, observe the different between growth rate line chart and main financial trend line charts.
