/** @jsx jsx **/
import React from "react";
import { css, jsx } from "@emotion/core";

const style = css`
    margin: 40%;
`

export default class EmptyDapp extends React.Component{
    render(){
        return <div css={style}>
            <img  src="https://wavesexplorer.com/images/erroring-88.905d816e1748ea540e287c909dc82195.svg"/>
        </div>
    }

}
