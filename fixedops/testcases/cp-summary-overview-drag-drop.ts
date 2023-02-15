import { testingAsserts as ts } from "../deps-test.ts";
import { getSitesToInspect } from "../sites.ts";
import { CpSelectors as cps } from "../selectors/cp-overview.ts";
import { fixedopsCommonLogin } from "./common/fixedops-common-login.ts";
import { dragAndDrop, startLogger } from "../utilities/utils.ts";

const logger = startLogger();
const errors: string[] = [];

function fixedOpsCpOverviewTest() {
  getSitesToInspect().forEach((site) => {
    const metrics = site.metrics;
    Deno.test({
      name: `[DEMO-TEST] ${site.name} FixedOps CP Summary Overview Graphs Drag Drop Test`,
      fn: async () => {
        const execMetrics = metrics.assuranceCaseExec.instance({
          initOn: new Date(),
          txId: metrics.metricsTransactionId,
          caseID: "DEMO-TEST",
          host: Deno.hostname(),
          status: "pass",
          pageURL: site.baseURL,
        });
        try {
          await cpOverviewPageGraphsDragDropTest(site.baseURL);
        } catch (error) {
          execMetrics.labels.object.status = "fail";
          execMetrics.labels.object.statusMessage =
            "Error in FixedOps CP Summary Overview Graphs Drag Drop Test";
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

async function cpOverviewPageGraphsDragDropTest(baseURL: string) {
  let browser = null;

  try {
    const oBrowser = await fixedopsCommonLogin(baseURL);
    const page = oBrowser.page;
    browser = oBrowser.browser;
    const navigationPromise = oBrowser.navigationPromise;

    await navigationPromise;
    await page.waitForTimeout(15000);

    await page.waitForSelector(cps.cpsummary);
    await page.click(cps.cpsummary);
    logger.info("CP expand collapse link clicked!!!");

    await page.waitForSelector(cps.cpOverview);
    await page.click(cps.cpOverview);
    await navigationPromise;
    await page.waitForTimeout(8000);

    const title = await page.title();
    if (title == "CP Summary Overview") {
      logger.info("CP Summary  Overview title verify success");

      let selector = await page.waitForSelector(cps.getChart(1));
      const defaultPositionElement_1 = await page.evaluate((el) => {
        const { x, y } = el.getBoundingClientRect();
        return { x, y };
      }, selector);
      await page.waitForTimeout(5000);
      await dragAndDrop(page, cps.getChart(1), cps.getChart(2));
      await page.waitForTimeout(8000);

      selector = await page.waitForSelector(cps.getChart(1));
      const currentPosition = await page.evaluate((el) => {
        const { x, y } = el.getBoundingClientRect();
        return { x, y };
      }, selector);

      await page.waitForTimeout(5000);
      if (
        (currentPosition.x != defaultPositionElement_1.x &&
          currentPosition.y != defaultPositionElement_1.y) ||
        (currentPosition.x == defaultPositionElement_1.x &&
          currentPosition.y != defaultPositionElement_1.y) ||
        (currentPosition.x != defaultPositionElement_1.x &&
          currentPosition.y == defaultPositionElement_1.y)
      ) {
        logger.info("graph dropped success");
        await page.waitForSelector(cps.resetDragBtn);
        await page.click(cps.resetDragBtn);
        await page.waitForTimeout(8000);
        logger.info("reset button clicked");
        selector = await page.waitForSelector(cps.getChart(1));
        const position = await page.evaluate((el) => {
          const { x, y } = el.getBoundingClientRect();
          return { x, y };
        }, selector);
        await page.waitForTimeout(5000);

        position.x == defaultPositionElement_1.x &&
        position.y == defaultPositionElement_1.y
          ? logger.info(
              "graphs drag and drop and reset button functionality working success"
            )
          : [
              logger.error(
                "graphs drag and and reset button functionality drop working fail"
              ),
              errors.push(
                "graphs drag and drop and reset button functionality working fail"
              ),
            ];
        await page.waitForTimeout(5000);
      } else {
        logger.error("graph dropped fail");
        errors.push("graph dropped fail");
      }
    } else {
      logger.error("cp overview page title verify failed");
      errors.push("cp overview page title verify failed");
    }
    ts.assert(
      errors.length == 0,
      `Error in CP Summary Page: ${errors.join("\n")}`
    );
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await browser?.close();
  }
}
fixedOpsCpOverviewTest();
