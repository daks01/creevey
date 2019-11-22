import React from "react";
import { css } from "@emotion/core";
import Checkbox from "@skbkontur/react-ui/Checkbox";
import Gapped from "@skbkontur/react-ui/Gapped";
import Button from "@skbkontur/react-ui/Button";
import ArrowTriangleRightIcon from "@skbkontur/react-icons/ArrowTriangleRight";
import DeleteIcon from "@skbkontur/react-icons/Delete";
import OkIcon from "@skbkontur/react-icons/Ok";
import ClockIcon from "@skbkontur/react-icons/Clock";
import { isTest, CreeveySuite, CreeveyTest } from "../../../types";
import Spinner from "@skbkontur/react-ui/Spinner";
import { CreeveyContex } from "../../CreeveyContext";

interface TestTreeProps {
  title: string;
  tests: CreeveySuite | CreeveyTest;
}

interface TestTreeState {
  opened: boolean;
}

export class TestTree extends React.Component<TestTreeProps, TestTreeState> {
  static contextType = CreeveyContex;
  context: React.ContextType<typeof CreeveyContex> = this.context;
  state: TestTreeState = { opened: this.props.tests.path.length == 0 };
  checkbox = React.createRef<Checkbox>();

  componentDidUpdate(prevProps: TestTreeProps) {
    if (!this.checkbox.current || isTest(prevProps.tests) || isTest(this.props.tests)) {
      return;
    }
    if (!prevProps.tests.indeterminate && this.props.tests.indeterminate) {
      this.checkbox.current.setIndeterminate();
    }
    if (prevProps.tests.indeterminate && !this.props.tests.indeterminate) {
      this.checkbox.current.resetIndeterminate();
    }
  }
  render() {
    const { tests } = this.props;
    if (isTest(tests)) {
      const emptyResults = !tests.results || tests.results.length == 0;
      return (
        <div
          css={css`
            margin-left: 20px;
          `}
        >
          <Gapped gap={5}>
            <Gapped gap={5}>
              <Checkbox
                ref={this.checkbox}
                checked={tests.skip ? false : tests.checked}
                disabled={Boolean(tests.skip)}
                onChange={this.handleCheck}
              />
              <Button use="link" disabled={emptyResults} onClick={this.handleOpenTestResults}>
                {this.props.title}
              </Button>
            </Gapped>
            {this.renderStatus(tests)}
          </Gapped>
        </div>
      );
    }
    return (
      <>
        <Gapped gap={5}>
          <span
            css={css`
              display: inline-block;
              cursor: pointer;
              transform: ${this.state.opened ? "rotate(45deg)" : ""};
            `}
          >
            <ArrowTriangleRightIcon onClick={this.handleSubTreeOpen} />
          </span>
          <Gapped gap={5}>
            <Checkbox
              ref={this.checkbox}
              checked={tests.skip ? false : tests.checked}
              disabled={Boolean(tests.skip)}
              onChange={this.handleCheck}
            />
            <Button use="link" onClick={this.handleSubTreeOpen}>
              {this.props.title}
            </Button>
          </Gapped>
          {this.renderStatus(tests)}
        </Gapped>
        {this.state.opened && (
          <div
            css={css`
              margin-left: 20px;
            `}
          >
            {Object.entries(tests.children).map(([title, suite]) => (
              <TestTree key={title} title={title} tests={suite} />
            ))}
          </div>
        )}
      </>
    );
  }

  renderStatus({ status }: CreeveySuite | CreeveyTest) {
    switch (status) {
      case "failed": {
        return <DeleteIcon color="#d9472b" />;
      }
      case "success": {
        return <OkIcon color="#419d14" />;
      }
      case "running": {
        return <Spinner type="mini" caption="" dimmed />;
      }
      case "pending": {
        return <ClockIcon color="#a0a0a0" />;
      }
      default: {
        return null;
      }
    }
  }

  handleOpenTestResults = () => isTest(this.props.tests) && this.context.onTestResultsOpen(this.props.tests.path);
  handleSubTreeOpen = () => this.setState(({ opened }) => ({ opened: !opened }));
  handleCheck = (_: React.ChangeEvent, checked: boolean) => {
    this.context.onTestToogle(this.props.tests.path, checked);
  };
}