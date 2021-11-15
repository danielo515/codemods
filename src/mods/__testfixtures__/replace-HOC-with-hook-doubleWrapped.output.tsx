import React from 'react';
import {
    Modal,
    ModalFooter,
    ModalHeader,
    FormRow,
    DescriptionText,
    Button,
    List,
    ListItem,
    RawCard,
    Icon,
} from 'spring';
import type { CompanyPension } from 'types';
import phrases from './PensionSetupOptionsModal.phrases';
import styles from './PensionSetupOptionsModal.scss';
import type { Form } from 'components/ControlledForm';
import ControlledForm from 'components/ControlledForm';
import { usePolyglot } from 'components/polyglotProvider';

type Props = {
    form: Form<any>;
    isOpen: boolean;
    closeModal: () => void;
    selectPensionProvider: (...args: Array<any>) => any;
    companyPensions: Array<CompanyPension>;
};

const Item = ({ title, subtitle, img, onClick }) => (
    <ListItem onClick={onClick}>
        <DescriptionText title={title} subtitle={subtitle} avatar={img} />
        <Icon type="ChevronRight" color="disabled" />
    </ListItem>
);

export const PensionSetupOptionsModal = (props: Props) => {
    const { __ } = usePolyglot(phrases);
    const { isOpen, closeModal, selectPensionProvider, companyPensions } =
        props;
    return (
        <Modal isOpen={isOpen} close={closeModal}>
            <ModalHeader>
                <DescriptionText
                    title={__('title')}
                    subtitle={__(`description`)}
                    variant="big"
                />
            </ModalHeader>
            <div className={styles.hideScrollbar}>
                <RawCard>
                    <List size="xLarge"></List>
                </RawCard>
            </div>

            <ModalFooter>
                <FormRow align="right" stretchChildren={false}>
                    <Button color="secondary" onClick={closeModal}>
                        {__('cancel')}
                    </Button>
                </FormRow>
            </ModalFooter>
        </Modal>
    );
};
export default ControlledForm<Props>(PensionSetupOptionsModal);
