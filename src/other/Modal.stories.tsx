import { ButtonModal } from './ButtonModal';
import { ModalService } from './ModalService';
import { Meta, StoryObj, StoryFn } from '@storybook/react';
import { Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { container } from 'tsyringe';

// resolves global ModalService
const service = container.resolve(ModalService);

export default {
  title: 'Core/Modal',
  component: ButtonModal,
} as Meta<typeof ButtonModal>;

type BtnStory = StoryObj<typeof ButtonModal>;


const Template: StoryFn<typeof ButtonModal> = (args) => (
  <div>
    <ButtonModal modalService={service} element={args.element} anchor={args.anchor} modalType={args.modalType}>
      {args.children}
    </ButtonModal>
  </div>
);

export const Primary: BtnStory = Template.bind({});

export const Secondary = Template.bind({});

const buildList = (text: string, index: number) => (
  <ListItem key={text} disablePadding>
    <ListItemButton>
      <ListItemIcon>
        {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
      </ListItemIcon>
      <ListItemText primary={text} />
    </ListItemButton>
  </ListItem>
);

Primary.args = {
  children: 'Press me',
  element: () => (
    <div>
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map(buildList)}
      </List>
      <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map(buildList)}
      </List>
    </div>
  ),
};
Secondary.args = { children: 'Press me', element: <div>TESTING</div> };

export const MultipleDrawerButtons: StoryFn<typeof ButtonModal> = () => <div>
  <ButtonModal modalService={service} element={'element1'} anchor="bottom" modalType='drawer'>Bottom Drawer</ButtonModal>
  <ButtonModal modalService={service} element={'element2'} anchor="left" modalType='drawer'>Left Drawer</ButtonModal>
</div>;
