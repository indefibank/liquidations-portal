/** @jsx jsx */
import useSWR from 'swr';
import { Button, Flex, Text, Image, jsx, Input, Heading, Divider } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { DialogOverlay, DialogContent } from '@reach/dialog';

import { fadeIn, slideUp } from '../../lib/keyframes';
import getMaker from '../../lib/maker';

type Props = {
  showDialog: boolean;
  onDismiss: () => void;
  mobile: boolean;
  colAvailable: string;
  minBid: string;
  maxBid: string;
  vatBalance: string;
};

const BidModal = ({
  showDialog,
  onDismiss,
  mobile,
  colAvailable,
  minBid,
  maxBid,
  vatBalance
}: Props): JSX.Element => {
  const { data: daiBalance } = useSWR('/balances/dai', () =>
    getMaker().then(maker => maker.getToken('DAI').balance())
  );

  return (
    <DialogOverlay isOpen={showDialog} onDismiss={onDismiss}>
      <DialogContent
        aria-label="Place a bid"
        sx={
          mobile
            ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
            : { variant: 'dialog.desktop', animation: `${fadeIn} 350ms ease`, width: '450px' }
        }
      >
        <Flex sx={{ flexDirection: 'column' }}>
          <Heading>Place a Bid</Heading>
          <Image variant="bannerSmall" src={'/assets/link-banner-texture.png'} />
          <Flex sx={{ justifyContent: 'space-between', alignItems: 'flex-end', my: 2 }}>
            <Text sx={{ fontWeight: 'bold' }}>Collateral Available</Text>
            <Heading variant="mediumHeading">{colAvailable}</Heading>
          </Flex>
          <Divider />
          <Flex sx={{ justifyContent: 'space-between', my: 2 }}>
            <Text>DAI in the VAT</Text>
            <Flex sx={{ flexDirection: 'column', alignItems: 'flex-end' }}>
              <Text>{vatBalance} DAI</Text>
              <Text>Deposit</Text>
            </Flex>
          </Flex>
          <Flex sx={{ flexDirection: 'column', my: 3 }}>
            <Flex sx={{ justifyContent: 'space-between' }}>
              <Text sx={{ fontWeight: 'bold', fontSize: 3 }}>Amount of Dai</Text>
              <Text sx={{ fontSize: 3 }}>
                Wallet balance: {daiBalance && daiBalance.toBigNumber().toFormat(2)}
              </Text>
            </Flex>
            <Input placeholder="0.0"></Input>
            <Flex sx={{ justifyContent: 'space-between', my: 2, px: 2 }}>
              <Flex sx={{ flexDirection: 'column' }}>
                <Text sx={{ color: 'textSecondary' }}>Min bid</Text>
                <Text>{minBid} Dai</Text>
              </Flex>
              <Flex sx={{ flexDirection: 'column' }}>
                <Text sx={{ color: 'textSecondary' }}>Max bid</Text>
                <Text>{maxBid} Dai</Text>
              </Flex>
            </Flex>
          </Flex>
          <Divider />
          <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
            <Flex sx={{ flexDirection: 'column' }}>
              <Text sx={{ fontWeight: 'bold' }}>Amount of Collateral</Text>
              <Text variant="caps" sx={{ fontWeight: 'body', fontSize: 5, color: 'text', pl: 2 }}>
                0.00 LINK
              </Text>
            </Flex>
            <Text sx={{ color: 'textSecondary', pr: 2 }}>≈ $0.00</Text>
          </Flex>
          <Button sx={{ mt: 3 }}>Place a bid</Button>
        </Flex>
      </DialogContent>
    </DialogOverlay>
  );
};

export default BidModal;
