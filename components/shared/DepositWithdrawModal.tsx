/** @jsx jsx */
import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  jsx,
  Heading,
  Close,
  Text,
  Input,
  Divider,
  Spinner,
  Checkbox,
  Label,
  Link
} from 'theme-ui';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { Icon } from '@makerdao/dai-ui-icons';
import BigNumber from 'bignumber.js';

import { fadeIn, slideUp } from 'lib/keyframes';
import { useAccountTokenBalance, useAccountVatBalance } from 'lib/hooks';
import getMaker, { getNetwork } from 'lib/maker';
import { bigNumToFormat, getEtherscanLink } from 'lib/utils';
import useAccountsStore from 'stores/accounts';
import useApprovalsStore from 'stores/approvals';
import { transactionsApi } from 'stores/transactions';
import Stack from 'components/layouts/Stack';

type Props = {
  showDialog: boolean;
  onDismiss: () => void;
  mobile: boolean;
};

const DepositWithdrawModal = ({ showDialog, onDismiss, mobile }: Props): JSX.Element => {
  const [
    hasJoinUsdvApproval,
    hasJoinUsdvHope,
    enableJoinUsdvApproval,
    enableJoinUsdvHope,
    joinUsdvApprovalPending,
    joinUsdvHopePending
  ] = useApprovalsStore(state => [
    state.hasJoinUsdvApproval,
    state.hasJoinUsdvHope,
    state.enableJoinUsdvApproval,
    state.enableJoinUsdvHope,
    state.joinUsdvApprovalPending,
    state.joinUsdvHopePending
  ]);
  const [isDeposit, setIsDeposit] = useState(true);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;
  const { data: usdvBalance } = useAccountTokenBalance('USDV', address);
  console.log(`vat balance for address: ${address}`);
  const { data: vatBalance } = useAccountVatBalance(address);

  console.log(`vatBalance: ${vatBalance}`);

  const handleTermsChecked = () => setTermsChecked(!termsChecked);
  const handleAcceptTerms = () => setHasAcceptedTerms(true);

  const LegalContent = () => {
    return (
      <>
        <Box variant="cards.primary" sx={{ mt: 2 }}>
          <Text sx={{ fontWeight: 'bold', mb: 2 }}>Acceptance of Terms</Text>
          <Text>
            Please read these{' '}
            <Link href={'/terms'} target="_blank" sx={{ fontWeight: 'semiBold' }}>
              Terms of Service
            </Link>{' '}
            (this “Agreement”) carefully. Your use or access of the Site or the Services (as defined below)
            constitutes your consent to this Agreement.
          </Text>
        </Box>
        <Flex sx={{ flexDirection: 'row', mt: 3 }}>
          <Label>
            <Checkbox checked={termsChecked} onClick={handleTermsChecked} />
            <Text>
              I have read and accept the{' '}
              <Link href={'/terms'} target="_blank">
                Terms of Service
              </Link>
              .
            </Text>
          </Label>
        </Flex>
        <Button disabled={!termsChecked} onClick={handleAcceptTerms} sx={{ mt: 2, width: '100%' }}>
          Continue
        </Button>
      </>
    );
  };

  const ApprovalsContent = () => {
    return (
      <>
        <Text sx={{ color: 'secondaryEmphasis', mb: 2 }}>
          To participate in auctions you need to sign the approval transactions below and move Usdv that will
          be used for bidding to the VAT
        </Text>
        <Divider sx={{ width: '100%' }} />
        <Flex sx={{ justifyContent: 'space-between', my: 2 }}>
          <Text sx={{ fontWeight: 'semiBold' }}>Usdv Wallet Balance</Text>
          <Text>{bigNumToFormat(usdvBalance, 'USDV')}</Text>
        </Flex>
        <Divider sx={{ width: '100%', mb: 3 }} />

        <Stack gap={4} sx={{ mt: 4 }}>
          <Box>
            <Flex sx={{ justifyContent: 'space-between', my: 2 }}>
              <Text sx={{ fontWeight: 'semiBold' }}>Usdv in the VAT</Text>
              <Text>{bigNumToFormat(vatBalance, 'USDV')}</Text>
            </Flex>
            <Button
              sx={{ width: '100%' }}
              onClick={enableJoinUsdvApproval}
              disabled={hasJoinUsdvApproval || joinUsdvApprovalPending}
              variant={hasJoinUsdvApproval || joinUsdvApprovalPending ? 'outline' : 'primary'}
            >
              {!hasJoinUsdvApproval && !joinUsdvApprovalPending && 'Unlock Usdv in the VAT'}
              {joinUsdvApprovalPending && (
                <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
                  Unlocking USDV in the VAT <Spinner size={20} ml={2} />
                </Flex>
              )}
              {hasJoinUsdvApproval && (
                <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
                  Usdv in the VAT Unlocked <Icon name="checkmark" color="primary" ml={2} />
                </Flex>
              )}
            </Button>
            {!(hasJoinUsdvApproval || joinUsdvApprovalPending) && (
              <Text sx={{ color: 'textSecondary', textAlign: 'center', mt: 2 }}>
                This action allows you to deposit Usdv into the VAT
              </Text>
            )}
          </Box>
          <Box>
            <Button
              sx={{ width: '100%' }}
              onClick={enableJoinUsdvHope}
              disabled={hasJoinUsdvHope || joinUsdvHopePending}
              variant={hasJoinUsdvHope || joinUsdvHopePending ? 'outline' : 'primary'}
            >
              {!joinUsdvHopePending ? (
                'Authorize the VAT'
              ) : (
                <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
                  Authorizing the VAT <Spinner size={20} ml={2} />
                </Flex>
              )}
            </Button>
            <Text sx={{ color: 'textSecondary', textAlign: 'center', mt: 2 }}>
              This action allows the VAT to use the USDV you have deposited
            </Text>
          </Box>
        </Stack>
      </>
    );
  };

  const DepositWithdrawContent = () => {
    const [value, setValue] = useState<string>('');
    const [isTxProcessing, setIsTxProcessing] = useState<boolean>(false);
    const [isTxError, setIsTxError] = useState<{ txId: string; error: string; hash: string } | null>(null);

    const canDeposit = new BigNumber(value).lte(new BigNumber(usdvBalance));
    const canWithdraw = new BigNumber(value).lte(new BigNumber(vatBalance));

    const resetModalState = () => {
      setIsTxProcessing(false);
      setIsTxError(null);
    };

    const updateValue = (e: { currentTarget: { value: string } }) => {
      const newValueStr = e.currentTarget.value;
      if (!/^((0|[1-9]\d*)(\.\d+)?)?$/.test(newValueStr)) return; // only non-negative valid numbers

      setValue(newValueStr);
    };

    const depositMax = () => {
      setValue(usdvBalance.toFixed(6));
    };

    const withdrawMax = () => {
      setValue(vatBalance.toFixed(6));
    };

    const moveUsdv = async () => {
      const maker = await getMaker();
      const txCreator = isDeposit
        ? () => maker.service('liquidation').joinUsdvToAdapter(value)
        : () => maker.service('liquidation').exitUsdvFromAdapter(value);

      await transactionsApi.getState().track(txCreator, `${isDeposit ? 'Depositing' : 'Withdrawing'} USDV`, {
        pending: () => {
          setIsTxProcessing(true);
          setIsTxError(null);
        },
        mined: txId => {
          transactionsApi.getState().setMessage(txId, `${isDeposit ? 'Deposit' : 'Withdraw'} USDV finished`);
          onDismiss();
        },
        error: (txId, error, hash) => {
          setIsTxProcessing(false);
          setIsTxError({ txId, error, hash });
        }
      });
    };

    const ErrorContent = () => {
      return (
        <Flex sx={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <Icon name="warning" color="error" size={6} sx={{ mt: 2 }} />
          <Text variant="smallHeading" sx={{ mt: 2, mb: 4, fontWeight: 'bold' }}>
            {`${isDeposit ? 'Deposit' : 'Withdraw'} failed`}
          </Text>
          <Text sx={{ px: 4, mb: 5, textAlign: 'center' }}>
            Something went wrong with your transaction. Please try again.
          </Text>
          <Text sx={{ px: 4, mb: 2, fontSize: 2, textAlign: 'center' }}>
            View more details about the failed transaction.
          </Text>
          <Link
            href={getEtherscanLink(getNetwork(), (isTxError && isTxError.hash) || '', 'transaction')}
            target="_blank"
          >
            <Text
              variant="text"
              sx={{
                color: 'accentBlue',
                fontSize: 2
              }}
            >
              View on VelasExplorer <Icon name="arrowTopRight" size="2" color="accentBlue" />
            </Text>
          </Link>
          <Button variant="primaryOutline" onClick={resetModalState} sx={{ width: '100%', mt: 4, mb: 2 }}>
            Go back and try again
          </Button>
        </Flex>
      );
    };

    return isTxError ? (
      <ErrorContent />
    ) : (
      <>
        <Text sx={{ color: 'secondaryEmphasis', mb: 2 }}>
          You can deposit Usdv in the VAT here. This is the USDV that you will be able to use for bidding on
          auctions.
        </Text>
        <Divider sx={{ width: '100%' }} />
        <Flex sx={{ justifyContent: 'space-between', my: 2 }}>
          <Text sx={{ fontWeight: 'semiBold' }}>Usdv Wallet Balance</Text>
          <Text>{bigNumToFormat(usdvBalance, 'USDV')}</Text>
        </Flex>
        <Divider sx={{ width: '100%', mb: 3 }} />
        <Flex sx={{ mb: 4 }}>
          <Button
            sx={{
              width: '100%',
              backgroundColor: 'surface',
              fontSize: 3,
              fontWeight: 'semiBold',
              color: isDeposit ? 'text' : 'coolGrey',
              borderBottom: 'solid 1px',
              borderBottomColor: isDeposit ? 'primary' : 'coolGrey',
              borderRadius: 0,
              ':hover': {
                backgroundColor: 'surface'
              }
            }}
            onClick={() => setIsDeposit(!isDeposit)}
          >
            Deposit Usdv
          </Button>
          <Button
            sx={{
              width: '100%',
              backgroundColor: 'surface',
              fontSize: 3,
              fontWeight: 'semiBold',
              color: !isDeposit ? 'text' : 'coolGrey',
              borderBottom: 'solid 1px',
              borderBottomColor: !isDeposit ? 'primary' : 'coolGrey',
              borderRadius: 0,
              ':hover': {
                backgroundColor: 'surface'
              }
            }}
            onClick={() => setIsDeposit(!isDeposit)}
          >
            Withdraw Usdv
          </Button>
        </Flex>
        <Flex sx={{ justifyContent: 'space-between', mb: 2 }}>
          <Text sx={{ fontWeight: 'semiBold' }}>Usdv in the VAT</Text>
          <Text>{bigNumToFormat(vatBalance, 'USDV')}</Text>
        </Flex>
        {isDeposit ? (
          <Flex sx={{ mb: 4, position: 'relative' }}>
            <Input sx={{ mr: 2 }} placeholder="0.00" onChange={updateValue} type="number" value={value} />
            <Button
              variant="textual"
              disabled={usdvBalance.lte(0)}
              onClick={depositMax}
              sx={{
                position: 'absolute',
                right: 152,
                top: '6px',
                cursor: usdvBalance.lte(0) ? 'not-allowed' : 'cursor',
                color: usdvBalance.lte(0) ? 'textSecondary' : 'primary',
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}
            >
              max
            </Button>
            <Button sx={{ width: 180 }} onClick={moveUsdv} disabled={isTxProcessing || !canDeposit}>
              {isTxProcessing ? <Spinner size={20} sx={{ color: 'primary' }} /> : 'Deposit Usdv'}
            </Button>
          </Flex>
        ) : (
          <Flex sx={{ mb: 4, position: 'relative' }}>
            <Input
              sx={{ mr: 2 }}
              placeholder="0.00"
              onChange={updateValue}
              type="number"
              value={value}
              disabled={isTxProcessing}
            />
            <Button
              variant="textual"
              disabled={vatBalance.lte(0)}
              onClick={withdrawMax}
              sx={{
                position: 'absolute',
                right: 152,
                top: '6px',
                cursor: usdvBalance.lte(0) ? 'not-allowed' : 'cursor',
                color: usdvBalance.lte(0) ? 'textSecondary' : 'primary',
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}
            >
              max
            </Button>
            <Button sx={{ width: 180 }} onClick={moveUsdv} disabled={isTxProcessing || !canWithdraw}>
              {isTxProcessing ? <Spinner size={20} sx={{ color: 'primary' }} /> : 'Withdraw Usdv'}
            </Button>
          </Flex>
        )}
        <Button onClick={onDismiss} sx={{ mt: 3 }}>
          Explore Auctions
        </Button>
      </>
    );
  };

  return (
    <DialogOverlay isOpen={showDialog} onDismiss={onDismiss}>
      <DialogContent
        aria-label="Deposit or withdraw Usdv"
        sx={
          mobile
            ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
            : { variant: 'dialog.desktop', animation: `${fadeIn} 350ms ease`, width: '450px' }
        }
      >
        <Flex sx={{ flexDirection: 'column', pb: 3 }}>
          <Flex sx={{ justifyContent: 'space-between', mb: 2 }}>
            <Heading sx={{ fontWeight: 'bold' }}>
              {!hasJoinUsdvApproval && !hasJoinUsdvHope && !hasAcceptedTerms
                ? 'Terms of Use'
                : 'Unlock USDV to bid'}
            </Heading>
            <Close
              sx={{
                alignSelf: 'flex-end',
                height: 4,
                width: 4,
                p: 0,
                position: 'relative',
                top: '-4px',
                left: '8px'
              }}
              onClick={onDismiss}
            />
          </Flex>
          {hasJoinUsdvApproval && hasJoinUsdvHope ? (
            <DepositWithdrawContent />
          ) : !hasAcceptedTerms ? (
            <LegalContent />
          ) : (
            <ApprovalsContent />
          )}
        </Flex>
      </DialogContent>
    </DialogOverlay>
  );
};

export default DepositWithdrawModal;
