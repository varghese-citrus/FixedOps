import { testingAsserts as ts } from "../deps-test.ts";
import { getSitesToInspect } from "../sites.ts";
import { AdvisorTechMetricsSelector as as } from "../selectors/advisor-tech-metrics.ts";
import { fixedopsCommonLogin } from "./common/fixedops-common-login.ts";
import { getRandomNumberBetween, startLogger } from "../utilities/utils.ts";

const logger = startLogger();

const errors: string[] = [];

function fixedOpsAdvisorMetricsTest() {
  getSitesToInspect().forEach((site) => {
    const metrics = site.metrics;
    Deno.test({
      name: `[AEC-FOCP-UI-FN-LD-0010] ${site.name} FixedOps Advisor Metrics Page Month Category Chart Common Test`,
      fn: async () => {
        const execMetrics = metrics.assuranceCaseExec.instance({
          initOn: new Date(),
          txId: metrics.metricsTransactionId,
          caseID: "AEC-FOCP-UI-FN-LD-0010",
          host: Deno.hostname(),
          status: "pass",
          pageURL: site.baseURL,
        });
        try {
          await advisorMetricsPageMonthCategoryChartCommonTest(site.baseURL);
        } catch (error) {
          execMetrics.labels.object.status = "fail";
          execMetrics.labels.object.statusMessage =
            "Error in FixedOps Advisor Metrics Page Month Category Chart Common Test";
          execMetrics.labels.object.finalizeOn = new Date();
          metrics.record(execMetrics);
          await metrics.persistUitMetrics(metrics);
          throw error;
        }
        metrics.record(execMetrics);
        execMetrics.labels.object.finalizeOn = new Date();
        await metrics.persistUitMetrics(metrics);
      },
      sanitizeOps: false,
      sanitizeResources: false,
    });
  });
}

async function advisorMetricsPageMonthCategoryChartCommonTest(baseURL: string) {
  let browser = null;

  try {
    const oBrowser = await fixedopsCommonLogin(baseURL);
    const page = oBrowser.page;
    browser = oBrowser.browser;
    const navigationPromise = oBrowser.navigationPromise;
    await navigationPromise;
    await page.waitForTimeout(15000);

    await page.waitForSelector(as.advisorMetricsLink);
    await page.click(as.advisorMetricsLink);
    await navigationPromise;
    await page.waitForTimeout(15000);
    logger.info("advisor link clicked!!!");

    const title = await page.title();

    if (title == "Service Advisor Performance") {
      logger.info("Service Advisor Performance title verify success");

      const chartDetails = [
        {
          id: 1299,
          name: "Total Revenue",
        },
        {
          id: 1300,
          name: "Labor Revenue",
        },
        {
          id: 1301,
          name: "Parts Revenue",
        },
        {
          id: 1302,
          name: "Labor Sold Hours",
        },
        {
          id: 1303,
          name: "RO Count",
        },
        {
          id: 1304,
          name: "Job Count",
        },
        {
          id: 1305,
          name: "Labor Gross Profit",
        },
        {
          id: 1306,
          name: "Parts Gross Profit",
        },
        {
          id: 1307,
          name: "Effective Labor Rate",
        },
        {
          id: 1308,
          name: "Parts Markup",
        },
      ];

      const serviceAdvisorPerformanceTab = await page.$x(
        as.serviceAdvisorPerformanceTab
      );

      await serviceAdvisorPerformanceTab[0].click();
      await page.waitForTimeout(5000);

      let monthCategoryTab = await page.$x(as.categoryByMonthTab);

      await monthCategoryTab[0].click();
      await navigationPromise;
      await page.waitForTimeout(10000);

      const monthSel1 = await page.$x(as.monthCategorySel);
      await monthSel1[0].click();
      await page.waitForTimeout(4000);

      const num1 = await getRandomNumberBetween(1, 12);

      const month1 = await page.$x(as.monthSelectLi(num1));
      await month1[0].click();
      await page.waitForTimeout(4000);
      logger.info("month selected");
      await navigationPromise;
      await page.waitForTimeout(10000);

      for (let i = 0; i <= chartDetails.length - 1; i++) {
        await page.waitForTimeout(5000);
        const chartNameXpath = await page.$x(as.monthCategoryChartName(i + 1));
        const chartNumXpath = await page.$x(as.monthCategoryChartNumber(i + 1));

        await page.waitForTimeout(5000);

        const chartName: string = await (
          await chartNameXpath[0].getProperty("textContent")
        ).jsonValue();
        await page.waitForTimeout(5000);

        const chartNum = await (
          await chartNumXpath[0].getProperty("textContent")
        ).jsonValue();
        await page.waitForTimeout(5000);

        const data = chartDetails[i];

        data.name.trim() && chartNum == data.id
          ? logger.info(
              `chart name ${chartName} and number ${chartNum} verify success`
            )
          : [
              logger.info(
                `chart name ${chartName} and number ${chartNum} verify failed`
              ),
              errors.push(
                `chart name ${chartName} and number ${chartNum} verify failed`
              ),
            ];

        // if (data.name.trim() && chartNum == data.id) {
        //   logger.info(
        //     `chart name ${chartName} and number ${chartNum} verify success`
        //   );
        // } else {
        //   logger.info(
        //     `chart name ${chartName} and number ${chartNum} verify failed`
        //   );
        //   errors.push(
        //     `chart name ${chartName} and number ${chartNum} verify failed`
        //   );
        // }
        await page
          .waitForXPath(as.monthCategoryChartInfoIcon(i + 1299), {
            visible: true,
            timeout: 2000,
          })
          .then(() => {
            logger.info(`info icon ${i + 1} visible properly`);
          })
          .catch(() => {
            logger.info(`info icon ${i + 1} not visible properly`);
            errors.push(`info icon ${i + 1} not visible properly`);
          });

        await page.waitForTimeout(3000);
        const expandCollapseBtn = await page.waitForXPath(
          as.monthCategoryChartExpandCollapseBtn(i + 1),
          {
            visible: true,
            timeout: 2000,
          }
        );

        if (expandCollapseBtn != null) {
          logger.info(`expand button ${i + 1} display properly`);

          const expandBtn = await page.$x(
            as.monthCategoryChartExpandCollapseBtn(i + 1)
          );
          await page.waitForTimeout(2000);

          await expandBtn[0].click();
          await page.waitForTimeout(5000);

          await page
            .waitForSelector(as.popup, {
              visible: true,
              timeout: 4000,
            })
            .then(() => {
              logger.info(`chart ${i + 1} expand properly`);
            })
            .catch(() => {
              logger.error(`chart ${i + 1} not expand properly`);
              errors.push(`chart ${i + 1} not expand properly`);
            });

          // const popup = await page.$eval(as.popup, (elem) => {
          //   return elem.style.display !== "none";
          // });

          // popup
          //   ? logger.info(`chart ${i + 1} expand properly`)
          //   : [
          //       logger.error(`chart ${i + 1} not expand properly`),
          //       errors.push(`chart ${i + 1} not expand properly`),
          //     ];
          await page.waitForTimeout(4000);
          // await page.waitForSelector(as.monthCategoryCollapseBtn, {
          //   visible: true,
          // });
          const collapseBtn = await page.$eval(
            as.monthCategoryCollapseBtn,
            (elem) => {
              return elem.style.display !== "none";
            }
          );

          if (collapseBtn) {
            logger.info(`collapse button ${i + 1} display properly`);

            await page.click(as.monthCategoryCollapseBtn);
            await page.waitForTimeout(5000);

            await page
              .waitForSelector(as.popup, {
                visible: true,
                timeout: 4000,
              })
              .then(() => {
                logger.error(`chart ${i + 1} not collapse properly`);
                errors.push(`chart ${i + 1} not collapse properly`);
              })
              .catch(() => {
                logger.info(`chart ${i + 1} collapse properly`);
              });

            // try {
            //   const popup = await page.$eval(as.popup, (elem) => {
            //     return elem.style.display !== "none";
            //   });

            //   if (popup) {
            //     logger.error(`chart ${i + 1} not collapse properly`);
            //     errors.push(`chart ${i + 1} not collapse properly`);
            //   }
            // } catch (error) {
            //   const btnErr = [];
            //   btnErr.push(error);
            //   const e = btnErr.find((x) => x === error);
            //   e
            //     ? logger.info(`chart ${i + 1} collapse properly`)
            //     : [
            //         logger.error(`chart ${i + 1} not collapse properly`),
            //         errors.push(`chart ${i + 1} not collapse properly`),
            //       ];
            // }
          } else {
            logger.error(`collapse button ${i + 1} not display properly`);
            errors.push(`collapse button ${i + 1} not display properly`);
          }
        } else {
          logger.error(`expand button ${i + 1} not display properly`);
          errors.push(`expand button ${i + 1} not display properly`);
        }

        const viewBtn = await page.$x(as.monthCategoryViewDetailBtn(i + 1));
        await viewBtn[0].click();
        await navigationPromise;
        await page.waitForTimeout(8000);

        const title = await page.title();

        title == "Overview"
          ? logger.info(`view detail button ${i + 1} working properly`)
          : [
              logger.info(`view detail button ${i + 1} working properly`),
              errors.push(`view detail button ${i + 1} working properly`),
            ];

        await page.goBack();
        await navigationPromise;
        await page.waitForTimeout(10000);

        monthCategoryTab = await page.$x(as.categoryByMonthTab);

        await monthCategoryTab[0].click();
        await navigationPromise;
        await page.waitForTimeout(10000);
      }
    } else {
      logger.info("advisor metrics title verify failed");
      errors.push("advisor metrics title verify failed");
    }
    ts.assert(
      errors.length == 0,
      `Error in  Advisor Metrics Page: ${errors.join("\n")}`
    );
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await browser?.close();
  }
}
fixedOpsAdvisorMetricsTest();
