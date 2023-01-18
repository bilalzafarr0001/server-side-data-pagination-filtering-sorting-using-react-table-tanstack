import { Collapsible, CollapsibleItem, Button } from "react-materialize";

const Filter = ({ children, onApplyBtnClick, onCancelBtnClick }) => {
  return (
    <>
      <div className="filter-list__holder">{children}</div>
      <div className="filter-btns__holder">
        <button waves="light" onClick={onApplyBtnClick}>
          Apply
        </button>

        <button className="float-left mr-5 " onClick={onCancelBtnClick}>
          Cancel
        </button>
      </div>
    </>
  );
};
export default Filter;
