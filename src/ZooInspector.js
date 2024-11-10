'use strict'

export class ZooInspector {
  constructor(imageRecognitionSystem, inspectionLog) {
    this.imageRecognitionSystem = imageRecognitionSystem;
    this.inspectionLog = inspectionLog;
  }

  inspect(zoo) {
    const inspection = new Inspection(zoo, this.imageRecognitionSystem);
    inspection.runInspection();
    this.inspectionLog.log(inspection.inspectionStatuses);
  }
}

class Inspection {
  constructor(zoo, imageRecognitionSystem) {
    this.zoo = zoo;
    this.imageRecognitionSystem = imageRecognitionSystem;
    this.inspectionStatuses = [];
  }

  runInspection() {
    this.inspectEnclosuresAndAnimals();
    this.reportZooStatus();
  }

  inspectEnclosuresAndAnimals() {
    this.zoo.getEnclosures().forEach(enclosure => {
      this.inspectEnclosure(enclosure);
      this.inspectAnimal(enclosure);
    });
  }

  reportZooStatus() {
    const zooStatus = this.isZooInWarningStatus() ? Inspection.WARNING_STATUS : Inspection.OK_STATUS;
    this.reportStatus(Inspection.ZOO_STATUS_NAME, this.zoo.getId(), zooStatus);
  }

  isZooInWarningStatus() {
    return this.isNotEmptyInspectionStatuses();
  }

  isNotEmptyInspectionStatuses() {
    return !!this.inspectionStatuses.length;
  }

  reportEnclosureWarningStatus(enclosure) {
    this.reportStatus(Inspection.ENCLOSURE_STATUS_NAME, enclosure.getId(), Inspection.WARNING_STATUS);
  }

  reportAnimalWarningStatus(animal) {
    this.reportStatus(Inspection.ANIMAL_STATUS_NAME, animal.getName(), Inspection.WARNING_STATUS);
  }

  reportStatus(objectName, objectId, status) {
    this.inspectionStatuses.push(`${objectName}#${objectId}#${status}`);
  }

  inspectEnclosure(enclosure) {
    const enclosureImage = this.zoo.capturePictureOf(enclosure);
    const enclosureStatus = this.imageRecognitionSystem.recognizeEnclosureStatus(enclosure, enclosureImage);
    if (this.isNotSafeEnclosure(enclosureStatus)) {
      this.respondToNotSafeEnclosure(enclosure);
      this.reportEnclosureWarningStatus(enclosure);
    }
  }

  respondToNotSafeEnclosure(enclosure) {
    this.zoo.closeEnclosure(enclosure);
    this.zoo.requestSecurityTo(enclosure);
    this.zoo.requestMaintenanceCrewTo(enclosure);
  }

  isNotSafeEnclosure(enclosureStatus) {
    return !enclosureStatus.isEnclosureSafe();
  }

  inspectAnimal(enclosure) {
    const animalImage = this.zoo.capturePictureOf(enclosure.getAnimal());
    const animalStatus = this.imageRecognitionSystem.recognizeAnimalStatus(enclosure.getAnimal(), animalImage);
    if (animalStatus.isAnimalSick()) {
      this.respondToSickAnimal(enclosure);
      this.reportAnimalWarningStatus(enclosure.getAnimal());
    }
  }

  respondToSickAnimal(enclosure) {
    this.zoo.closeEnclosure(enclosure);
    this.zoo.requestVeterinaryTo(enclosure.getAnimal());
  }
}

Inspection.WARNING_STATUS = 'WARNING';
Inspection.OK_STATUS = 'OK';
Inspection.ZOO_STATUS_NAME = 'ZOO';
Inspection.ENCLOSURE_STATUS_NAME = 'ENCLOSURE';
Inspection.ANIMAL_STATUS_NAME = 'ANIMAL'
