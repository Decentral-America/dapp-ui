/** @jsx jsx*/
import React from 'react';
import {inject, observer} from 'mobx-react';
import AccountStore from '@stores/AccountStore';
import CubensisStore from '@stores/CubensisStore';
import NotificationStore from '@stores/NotificationStore';
import Button from '@components/DappUi/Button';
import {SignerStore} from '@stores/index';
import styled from '@emotion/styled';
import {css, jsx} from '@emotion/core';
import {fonts} from '@src/styles';
import {LoginType} from "@src/interface";

interface IProps {
    accountStore?: AccountStore
    signerStore?: SignerStore
    cubensisStore?: CubensisStore
    notificationStore?: NotificationStore
}


const Overlay = styled.div`
  background: rgba(0, 0, 0, 0.6);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Dialog = styled.div`
  background: white;
  width: 500px;
  border-radius: 4px;
  overflow: hidden;
  padding: 30px;
  position: relative;
`;

const Title = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    @include Body-4Basic900Centr;
    padding-bottom: 24px;
`;


const Icon = styled.svg`
    width: 20px;
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    transition-duration: .5s;
    &:hover{
       transform: scale(1.1);
    }
`;

const Body = styled.div`
    display: flex;
    flex-direction: column;
    justify-content:space-around;
    text-align: center;
    height: 100%;
    margin: 0 -4px ;
    & > *  {
    margin: 0 4px ;
    flex: 1;
    }
`;

const Description = styled.div`
${fonts.footerFont};
//text-align: left;
`;


@inject('accountStore', 'notificationStore', 'signerStore', 'cubensisStore')
@observer
export default class SignDialog extends React.Component <IProps> {

    handleCloseDialog = () => this.props.notificationStore!.isOpenLoginDialog = false;

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    handleSignWithCubensis = () => {
        this.handleCloseDialog();
        const cubensisStore = this.props.cubensisStore!;
        if (cubensisStore!.isCubensisConnectInstalled && !cubensisStore!.isCubensisConnectInitialized) {
            cubensisStore!.setupSynchronizationWithCubensisConnect();
        }
        cubensisStore.login()
            .catch(e => this.props.notificationStore!.notify(
                <a href="https://docs.waves.tech/en/ecosystem/waves-cubensis"  target="_blank" rel="noopener noreferrer">
                    install CubensisConnect</a>,
                {type: 'error', title: 'cubensis is not installed'})
            );
    };

    handleSignWithExchangeSeed = () => {
        this.handleCloseDialog();
        this.props.signerStore!.login(LoginType.SEED);
    };

    handleSignWithExchangeMail = () => {
        this.handleCloseDialog();
        this.props.signerStore!.login(LoginType.EMAIL);
    };

    handleSignWithMetamask = () => {
        this.handleCloseDialog();
        this.props.signerStore!.login(LoginType.METAMASK);
    };

    handleClickOutside = (event: any) => {
        const path = event.path || event.composedPath();
        if (!(path.some((element: any) => element.dataset && element.dataset.owner === 'sign'))) {
            this.handleCloseDialog();
        }
    };

    render(): React.ReactNode {
        const open = this.props.notificationStore!.isOpenLoginDialog;
        const isCubensis = this.props.cubensisStore!.isBrowserSupportsCubensisConnect;
        if (!open) return null;
        return <Overlay>
            <Dialog data-owner={'sign'}>
                <CloseIcon onClick={this.handleCloseDialog}/>
                <Title>Connect a wallet to get started</Title>
                <Body>
                    <div>
                    <img src="https://decentralchain.io/wp-content/uploads/2022/02/cubensis-connect-dark.png" width="33%" alt="Cubensis Logo"/><br/><br/>
                        <Button css={css`width: 33%`} onClick={this.handleSignWithCubensis} disabled={!isCubensis}>
                            Sign in with Cubensis
                        </Button>
                        <Description css={!isCubensis && css`color: #3c26bf`}>
                            <br/>{
                            isCubensis
                                ? 'The network will be chosen in CubensisConnect by user'
                                : 'Cubensis Connect doesn’t support this browser'
                        }</Description>
                    </div><br/><br/>
                    <div>
                    <img src="https://decentral.exchange/img/icons/wavesdex-black-32.svg" width="33%" alt="Decentral Exchange Logo"/><br/><br/>
                        <Button css={css`width: 33%`} onClick={this.handleSignWithExchangeSeed} >
                            Sign in with Decentral Exchange (Seed)</Button>
                        <Description><br/>The network will be MainNet by default</Description>
                    </div>
                </Body>
            </Dialog>
        </Overlay>;
    }
}

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) =>
    <Icon {...props} viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="Group 7">
            <rect id="Rectangle" width="21" height="1"
                  transform="matrix(-0.707107 0.707107 0.707107 0.707107 15.504 0.194214)" fill="black"></rect>
            <rect id="Rectangle_2" x="1.36194" y="0.194214" width="21" height="1"
                  transform="rotate(45 1.36194 0.194214)"
                  fill="black"></rect>
        </g>
    </Icon>;
