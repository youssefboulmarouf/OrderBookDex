import React from 'react';
import Offcanvas from 'react-bootstrap/Offcanvas';

interface AdminSectionProps {
    showAdminSection: boolean; 
    handleClose: () => void;
}

const AdminSection: React.FC<AdminSectionProps> = (props) => {
    return (
        <Offcanvas show={props.showAdminSection} onHide={props.handleClose}>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Admin Section</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                
            </Offcanvas.Body>
        </Offcanvas>
    );
}

export default AdminSection;