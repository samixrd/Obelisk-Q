import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Logo } from "./Logo";
import "@testing-library/jest-dom";

describe("Logo Component", () => {
  it("renders correctly with default size", () => {
    render(<Logo />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies the provided size", () => {
    const size = 48;
    render(<Logo size={size} />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("width", size.toString());
    expect(svg).toHaveAttribute("height", size.toString());
  });

  it("contains the Obelisk path elements", () => {
    render(<Logo />);
    // Check for the presence of the geometric paths that make up the Logo
    const paths = document.querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(0);
  });
});
