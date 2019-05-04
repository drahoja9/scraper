import { MainPanelController } from "/src/contentScripts/mainPanelController.js";
import { ControllerMockup } from "./mocks.js";
import { Messages } from "/src/constants.js";
import { prepareTestPage } from "./setup";


// -------------------------------------------- Setup and teardown ----------------------------------------------

let controller;
let mainPanelController;

beforeEach(async function () {
    await prepareTestPage();
    controller = new ControllerMockup();
    mainPanelController = new MainPanelController(controller);
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('handle of initial load', () => {
    mainPanelController.toggleMinMax = jest.fn(() => {
    });
    mainPanelController.switchSides = jest.fn(() => {
    });

    mainPanelController.handleInitialLoad();
    expect(mainPanelController.toggleMinMax.mock.calls.length).toBe(0);
    expect(mainPanelController.switchSides.mock.calls.length).toBe(0);
    expect(controller.notify.mock.calls.length).toBe(0);

    mainPanelController._minimized = true;
    mainPanelController._onLeft = true;
    mainPanelController.handleInitialLoad();
    expect(mainPanelController.toggleMinMax.mock.calls.length).toBe(1);
    expect(mainPanelController.switchSides.mock.calls.length).toBe(1);
    expect(controller.notify.mock.calls.length).toBe(2);
    expect(controller.notify.mock.calls[0][0]).toEqual({ msg: Messages.MINIMIZE_MAXIMIZE });
    expect(controller.notify.mock.calls[1][0]).toEqual({ msg: Messages.SWITCH_SIDES });
});

test('turn main panel on anf off', () => {
    expect(mainPanelController.isInjected).toBe(false);
    expect(mainPanelController.isVisible).toBe(false);
    expect(mainPanelController.iframe).toBe(undefined);

    // Injecting panel
    mainPanelController.toggleMainPanel(false, false);
    expect(mainPanelController.isInjected).toBe(true);
    expect(mainPanelController.isVisible).toBe(true);
    expect(mainPanelController.iframe).not.toBe(undefined);
    const iframe = document.querySelector('.scraping-iframe-panel');
    const panelIframe = mainPanelController.iframe;
    expect(iframe).toBe(panelIframe);
    expect(controller.injectParts.mock.calls.length).toBe(1);

    // Hiding panel
    mainPanelController.toggleMainPanel(true, false);
    expect(mainPanelController.isInjected).toBe(true);
    expect(mainPanelController.isVisible).toBe(false);
    expect(mainPanelController.iframe.style.display).toEqual('none');
    expect(iframe).toBe(panelIframe);
    expect(controller.injectParts.mock.calls.length).toBe(1);

    // Showing panel
    mainPanelController.toggleMainPanel(false, true);
    expect(mainPanelController.isInjected).toBe(true);
    expect(mainPanelController.isVisible).toBe(true);
    expect(mainPanelController.iframe.style.display).toEqual('block');
    expect(iframe).toBe(panelIframe);
    expect(controller.injectParts.mock.calls.length).toBe(1);
});

test('minimize and maximize panel', () => {
    mainPanelController.toggleMainPanel(false, false);
    expect(mainPanelController.iframe.classList.contains('scraping-minimized')).toBe(false);

    mainPanelController.toggleMinMax();
    expect(mainPanelController.iframe.classList.contains('scraping-minimized')).toBe(true);

    mainPanelController.toggleMinMax();
    expect(mainPanelController.iframe.classList.contains('scraping-minimized')).toBe(false);
});

test('put panel on left and right', () => {
    mainPanelController.toggleMainPanel(false, false);
    expect(mainPanelController.iframe.classList.contains('scraping-left')).toBe(false);
    expect(mainPanelController.iframe.classList.contains('scraping-right')).toBe(true);

    mainPanelController.switchSides();
    expect(mainPanelController.iframe.classList.contains('scraping-left')).toBe(true);
    expect(mainPanelController.iframe.classList.contains('scraping-right')).toBe(false);

    mainPanelController.switchSides();
    expect(mainPanelController.iframe.classList.contains('scraping-left')).toBe(false);
    expect(mainPanelController.iframe.classList.contains('scraping-right')).toBe(true);
});
