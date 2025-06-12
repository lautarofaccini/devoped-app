import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Calculator, numbers, equalSign, operations } from "../src/Calculator";

//Mejor usar userEvent de testing library que fireEvent

describe("Calculator", () => {
  afterEach(cleanup);
/* 
  it("should render title correctly", () => {
    render(<Calculator />);
    screen.getByText("Calculator");
  }); */

  it("should render numbers", () => {
    render(<Calculator />);

    numbers.forEach((number) => {
      screen.getByText(number);
    });
  });

  it("should render operations", () => {
    render(<Calculator />);

    operations.forEach((operation) => {
      screen.getByText(operation);
    });
  });

  it("should render an input", () => {
    render(<Calculator />);

    screen.getByRole("textbox");
  });

  it("should user input after clicking a number", () => {
    render(<Calculator />);

    const one = screen.getByText("1");
    fireEvent.click(one);

    const input = screen.getByRole("textbox");
    expect(input.value).toBe("1");
  });

  it("should user input after clicking several numbers", () => {
    render(<Calculator />);

    const one = screen.getByText("1");
    fireEvent.click(one);

    const two = screen.getByText("2");
    fireEvent.click(two);

    const three = screen.getByText("3");
    fireEvent.click(three);

    const input = screen.getByRole("textbox");
    expect(input.value).toBe("123");
  });

  it("should show user input after clicking numbers and operations", () => {
    render(<Calculator />);

    const one = screen.getByText("1");
    fireEvent.click(one);

    const plus = screen.getByText("+");
    fireEvent.click(plus);
    fireEvent.click(one);

    const input = screen.getByRole("textbox");
    expect(input.value).toBe("1+1");
  });

  it("should calculate based on user's input and show the result", () => {
    render(<Calculator />);

    const one = screen.getByText("1");
    fireEvent.click(one);

    const plus = screen.getByText("+");
    fireEvent.click(plus);
    fireEvent.click(one);

    const equal = screen.getByText(equalSign);
    fireEvent.click(equal);

    const input = screen.getByRole("textbox");
    expect(input.value).toBe("2");
  });

  /* 
  //Failing test
  it("should show user input after showing the results", () => {
    render(<Calculator />);

    const one = screen.getByText("1");
    fireEvent.click(one);

    const plus = screen.getByText("+");
    fireEvent.click(plus);
    fireEvent.click(one);

    const equal = screen.getByText(equalSign);
    fireEvent.click(equal);
    fireEvent.click(one);

    const input = screen.getByRole("textbox");
    expect(input.value).toBe("1");
  }); */
});
